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
    sendDataReceivedConfirmation,
} from '../../../src/common_types/ws_types';
import Cookies from 'js-cookie';
import { SpotifyClient } from '../SpotifyClient';
import {
    TSpotifyAuthInfo,
    TSpotifyUser,
    TSongInfoCollection,
    TGenreMapping,
} from '../../../src/common_types/spotify_types';
import { ProfileSummary } from '../components/ProfileSummary';
// import { stringify, parse } from 'zipson';
import { LikedSongsLoading } from '../components/LikedSongsLoading';

import '../css/room.css';


export const Route = createLazyFileRoute('/room')({
    component: Room,
});

function Room() {
    const [link, setLink] = useState('Connecting...');
    const [roomId, setRoomID] = useState('');
    const [log, setLog] = useState('');
    const [userProfile, setUserProfile] = useState<TSpotifyUser | null>(null);
    const [bothReady, setBothReady] = useState<boolean>(false);
    const [selfDone, setSelfDone] = useState<boolean>(false);
    const [otherDone, setOtherDone] = useState<boolean>(false);
    const [spotifyClient, setSpotifyClient] = useState<SpotifyClient | null>(
        null,
    );
    const [likedSongs, setLikedSongs] = useState<object>({});
    const [genres, setGenres] = useState<object>({});

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

    useEffect(() => {
        getRoomId();
        const tokens = Cookies.get('own_tokens');
        if (!tokens) window.location.replace('/');
        const authInfo: TSpotifyAuthInfo = JSON.parse(tokens!);
        setSpotifyClient(
            new SpotifyClient(authInfo, () => {
                // Invalid token handler
                Cookies.remove('own_tokens');
                window.location.replace('/');
            }),
        );
    }, []);

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
        console.log(`Done with all data`);

        // // store compressed data to local storage
        // const compressed = stringify({songs: likedSongs, genres: genres});
        // try {
        //     localStorage.setItem('musicData', compressed);
        // } catch (e) {
        //     console.log('Could not cache the music data.');
        // }
    }

    function getProfile() {
        if (!spotifyClient) {
            alert('no spotify client!');
            return;
        }

        spotifyClient.getMe().then((profile) => {
            if (profile) setUserProfile(profile);
        });
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
                setLog('');
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
                sendDataReceivedConfirmation(sendMessage);
                break;

            case WsMessageType.Ping:
                console.log('Received ping');
                break;

            case WsMessageType.Ready:
                console.log('Received ready notification');
                setBothReady(true);
                break;

            case WsMessageType.DataDone:
                setOtherDone(true);
                console.log(`Received data confirmation`);
                break;

            case WsMessageType.DataReceived:
                console.log(`Received data received confirmation`);
                break;

            case WsMessageType.Abort:
                location.reload();
                break;

            default:
                break;
        }
    }, [lastMessage]);

    return (
        <div className='wrapper' id='room'>
            <div className='content'>
                <button
                    onClick={() =>
                        sendMessage(
                            JSON.stringify({
                                type: WsMessageType.Ping,
                                data: null,
                            }),
                        )
                    }
                >
                    Send ping
                </button>
                <button onClick={getProfile}>Get profile</button>
                <button
                    onClick={() =>
                        spotifyClient!
                            .abort()
                            .then(() => console.log('Aborted'))
                    }
                >
                    Abort
                </button>
                <hr />
                <p>Send this link to someone:</p>
                <p>{link}</p>
                <hr />
                <pre>{log}</pre>
                <hr />
                <ProfileSummary userProfile={userProfile} />
                <LikedSongsLoading
                    spotifyClient={spotifyClient}
                    bothReady={bothReady}
                    doneCallback={doneWithOwnData}
                    addLikedSongsCallback={addLikedSongs}
                />
                {/* {Object.entries(genres).map(([key, value]) => (
                    <div key={key}>
                        {JSON.stringify(value)} ({key})
                    </div>
                ))}
                <hr />
                {JSON.stringify(likedSongs)} */}
            </div>
        </div>
    );
}
