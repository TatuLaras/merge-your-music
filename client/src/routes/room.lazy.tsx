import { createLazyFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import {
    TWebsocketDataPacket,
    TWebsocketMessage,
    WsErrorCode,
    WsMessageType,
    sendAbort,
    sendData,
} from '../../../src/common_types/ws_types';
import Cookies from 'js-cookie';
import { SpotifyClient } from '../SpotifyClient';
import {
    Spotify,
    TSongInfoCollection,
    TGenreMapping,
    TMusicData,
} from '../../../src/common_types/spotify_types';
import { stringify } from 'zipson';

import { LikedSongsLoading } from '../components/LikedSongsLoading';
import { QuitButton } from '../components/QuitButton';
import { Link } from '../components/Link';

export const Route = createLazyFileRoute('/room')({
    component: Room,
});

function Room() {
    const [link, setLink] = useState('Connecting...');
    const [roomId, setRoomID] = useState('');
    const [selfDone, setSelfDone] = useState<boolean>(false);
    const [otherDone, setOtherDone] = useState<boolean>(false);
    const [spotifyClient, setSpotifyClient] = useState<SpotifyClient | null>(
        null,
    );
    const [likedSongs, setLikedSongs] = useState<TSongInfoCollection>({});
    const [genres, setGenres] = useState<TGenreMapping>({});
    const [readyToSync, setReadyToSync] = useState<boolean>(false);
    const [stage, setStage] = useState<'waiting' | 'sync'>('waiting');

    useEffect(() => {
        // Check for cached music data, if found, use it
        const compressed = localStorage.getItem('musicData');
        if (compressed) {
            window.location.replace('/results');
            return;
        }

        getRoomId();

        // Get Spotify auth info from cookies, redirect to login if none
        const tokens = Cookies.get('own_tokens');
        if (!tokens)
            window.location.replace(
                `${import.meta.env.VITE_BACKEND_BASE_URL}/spotify_login`,
            );
        const authInfo: Spotify.AuthInfo = JSON.parse(tokens!);
        setSpotifyClient(
            new SpotifyClient(authInfo, () => {
                // Invalid token handler
                Cookies.remove('own_tokens');
                window.location.replace(
                    `${import.meta.env.VITE_BACKEND_BASE_URL}/spotify_login`,
                );
            }),
        );
    }, []);

    async function addLikedSongs(
        songs: TSongInfoCollection,
        genres: TGenreMapping,
        internal: boolean = true,
    ) {
        if (internal) sendData({ songs: songs, genres: genres }, sendMessage);

        setLikedSongs((old) => {
            return {
                ...songs,
                ...old,
            };
        });

        setGenres((old) => {
            return {
                ...genres,
                ...old,
            };
        });
    }

    window.onbeforeunload = () => sendAbort(sendMessage);

    // TODO: Cache songs etc. in local storage
    // TODO: "Attach" songs to genres by artist id
    // TODO: account for different markets

    useEffect(() => {
        if (!selfDone || !otherDone) return;
        doneWithAllData();
    }, [selfDone, otherDone]);

    function newRoomId(roomId: string) {
        setRoomID(roomId);
        Cookies.set('room_id', roomId);
    }

    function getRoomId() {
        const existingRoomId = Cookies.get('room_id');
        if (existingRoomId) {
            newRoomId(existingRoomId);
            return;
        }

        fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/new_room`, {
            method: 'POST',
        })
            .then((res) => res.text())
            .then(newRoomId);
    }

    function doneWithOwnData() {
        console.log(`Done with own data`);
        const message: TWebsocketMessage = {
            type: WsMessageType.DataDone,
            data: null,
        };
        sendMessage(JSON.stringify(message));
        setSelfDone(true);
    }

    async function doneWithAllData() {
        // Cache songs etc. in local storage
        const musicData: TMusicData = { songs: likedSongs, genres: genres };
        const compressed = stringify(musicData as any);
        try {
            localStorage.setItem('musicData', compressed);
        } catch (e) {
            console.log('Could not cache the music data.');
            return;
        }

        window.location.replace('/results');
    }

    function onClose(event: CloseEvent) {
        setLink('Connecting...');
        const errorType = event.code as WsErrorCode;

        switch (errorType) {
            case WsErrorCode.RoomNotFound:
                Cookies.remove('room_id');
                getRoomId();
                break;

            case WsErrorCode.RoomFull:
                Cookies.remove('room_id');
                getRoomId();
                break;

            default:
                break;
        }
    }

    const { sendMessage, lastMessage /* , readyState */ } = useWebSocket(
        //, readyState
        `${import.meta.env.VITE_BACKEND_WS_BASE}/` + roomId,
        {
            onOpen: () => {
                setLink(
                    `${import.meta.env.VITE_BACKEND_BASE_URL}/share/` + roomId,
                );
            },
            onClose: onClose,
            shouldReconnect: () => true,
        },
    );

    // Handle incoming messages
    useEffect(() => {
        if (!lastMessage) return;

        const message: TWebsocketMessage = JSON.parse(lastMessage.data);

        switch (message.type) {
            case WsMessageType.Data:
                const data = message.data as TWebsocketDataPacket;
                addLikedSongs(data.songs, data.genres, false);
                break;

            case WsMessageType.Ready:
                console.log('Received ready notification');
                setStage('sync');
                setReadyToSync(true);
                break;

            case WsMessageType.DataDone:
                setOtherDone(true);
                console.log(`Received data confirmation`);
                break;

            case WsMessageType.Abort:
                if (stage === 'sync') location.reload();
                break;

            default:
                break;
        }
    }, [lastMessage]);

    useEffect(() => {
        console.log(`Stage changed to ${stage}`);
    }, [stage]);

    const pageContentInStage = {
        waiting: (
            <>
                <QuitButton />
                <Link link={link} />
            </>
        ),
        sync: (
            <>
                <QuitButton />
                <LikedSongsLoading
                    spotifyClient={spotifyClient}
                    readyToSync={readyToSync}
                    doneCallback={doneWithOwnData}
                    addLikedSongsCallback={addLikedSongs}
                />
            </>
        ),
    };

    return (
        <div className='wrapper' id='room'>
            <div className='content'>{pageContentInStage[stage]}</div>
        </div>
    );
}
