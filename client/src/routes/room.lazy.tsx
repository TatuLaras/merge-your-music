import { createLazyFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { TWebsocketMessage, WsErrorCode, WsMessageType } from '../../../src/common_types/ws_types';
import Cookies from 'js-cookie';
import { SpotifyClient } from '../SpotifyClient';
import {
    TSpotifyAuthInfo,
    TSpotifyUser,
} from '../../../src/common_types/spotify_types';
import { ProfileSummary } from '../components/ProfileSummary';
export const Route = createLazyFileRoute('/room')({
    component: Room,
});

function Room() {
    const [link, setLink] = useState('Connecting...');
    const [roomId, setRoomID] = useState('');
    const [log, setLog] = useState('');
    const [spotifyClient, setSpotifyClient] = useState<SpotifyClient | null>(
        null
    );
    const [userProfile, setUserProfile] = useState<TSpotifyUser | null>(null);
    const [likedSongs, setLikedSongs] = useState<object>({});
    const [genres, setGenres] = useState<object>({});

    // TODO: Cache songs etc. in local storage
    // TODO: "Attach" songs to genres by artist id
    // TODO: Send data to websocket, wait for confirmation, then send next data
    // TODO: Backoff-retry on spotify api calls
    
    function addLikedSongs(songs: object, genres: object) {
        // TODO: Call this function when data received from websocket
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

    function newRoomId(roomId: string) {
        console.log('Room ID: ' + roomId);
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
            })
        );
    }, []);

    function getProfile() {
        if (!spotifyClient) {
            alert('no spotify client!');
            return;
        }

        spotifyClient.getMe().then((profile) => {
            if (profile) setUserProfile(profile);
        });
    }

    function getLikedSongs() {
        if (!spotifyClient) {
            alert('no spotify client!');
            return;
        }

        spotifyClient.loadAllMeTracks(addLikedSongs);
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

    const { sendMessage, lastMessage } = useWebSocket(
        //, readyState
        'ws://localhost:5000/' + roomId,
        {
            onOpen: () => {
                setLog('');
                setLink('http://localhost:5000/share/' + roomId);
            },
            onClose: onClose,
            shouldReconnect: () => true,
        }
    );

    useEffect(() => {
        if (!lastMessage) return;
        
        setLog((old) => old + '\n' + lastMessage.data);

        const message: TWebsocketMessage = JSON.parse(lastMessage.data);
        if(message.type == WsMessageType.ReadyNotification) console.log('Ready!');

    }, [lastMessage]);

    return (
        <div className='wrapper'>
            <div className='content'>
                <button
                    onClick={() =>
                        sendMessage(JSON.stringify({ type: WsMessageType.Ping, data: null }))
                    }
                >
                    Send ping
                </button>
                <button onClick={getProfile}>Get profile</button>
                <button onClick={getLikedSongs}>Get liked songs</button>
                <hr />
                <p>Send this link to someone:</p>
                <p>{link}</p>
                <hr />
                <pre>{log}</pre>
                <hr />
                <ProfileSummary userProfile={userProfile} />
                {Object.entries(genres).map(([key, value]) => (
                    <div key={key}>{JSON.stringify(value)} ({key})</div>
                ))}
                <hr />
                {Object.entries(likedSongs).map(([key, value]) => (
                    <div key={key}>{value} ({key})</div>
                ))}
            </div>
        </div>
    );
}