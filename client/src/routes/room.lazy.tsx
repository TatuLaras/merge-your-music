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
    TSpotifyAuthInfo,
    TSongInfoCollection,
    TGenreMapping,
    TMusicData,
} from '../../../src/common_types/spotify_types';
import { stringify, parse } from 'zipson';

import { LikedSongsLoading } from '../components/LikedSongsLoading';
import { Results } from '../components/Results';
import { QuitButton } from '../components/QuitButton';

import '../css/room.css';

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
    const [stage, setStage] = useState<'waiting' | 'sync' | 'display'>(
        'waiting',
    );

    useEffect(() => {
        // Check for cached music data, if found, use it
        const compressed = localStorage.getItem('musicData');
        if (compressed) {
            console.log('Found cached music data');
            const musicData = parse(compressed) as TMusicData;
            setLikedSongs(musicData.songs);
            setGenres(musicData.genres);
            setStage('display');
        }

        getRoomId();

        // Get Spotify auth info from cookies, redirect to login if none
        const tokens = Cookies.get('own_tokens');
        if (!tokens)
            window.location.replace(
                'http://localhost:5000/spotify_login/initial',
            );
        const authInfo: TSpotifyAuthInfo = JSON.parse(tokens!);
        setSpotifyClient(
            new SpotifyClient(authInfo, () => {
                // Invalid token handler
                Cookies.remove('own_tokens');
                window.location.replace(
                    'http://localhost:5000/spotify_login/initial',
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

        fetch('http://localhost:5000/new_room', {
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
        }

        setStage('display');
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
        'ws://localhost:5000/' + roomId,
        {
            onOpen: () => {
                setLink('http://localhost:5000/share/' + roomId);
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
                setStage((old) => {
                    if (old === 'display') return old;
                    return 'sync';
                });
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
            <div className='link'>
                <p>Send this link to someone:</p>
                <p>{link}</p>
            </div>
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
        display: (
            <>
                <QuitButton />
                <Results
                    musicData={
                        { songs: likedSongs, genres: genres } as TMusicData
                    }
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
