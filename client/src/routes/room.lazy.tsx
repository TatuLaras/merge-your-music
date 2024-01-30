import { createLazyFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { WsErrorCode } from '../../../src/common_types/ws_types';
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
        if (lastMessage) {
            setLog((old) => old + '\n' + lastMessage.data);
        }
    }, [lastMessage]);

    return (
        <div className='wrapper'>
            <div className='content'>
                <button
                    onClick={() =>
                        sendMessage(`ping (${new Date().toLocaleTimeString()})`)
                    }
                >
                    Send ping
                </button>
                <button onClick={getProfile}>Get profile</button>
                <hr />
                <p>Send this link to someone:</p>
                <p>{link}</p>
                <hr />
                <pre>{log}</pre>
                <ProfileSummary userProfile={userProfile} />
            </div>
        </div>
    );
}
