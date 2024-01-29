import { createLazyFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';

import Cookies from 'js-cookie';

export const Route = createLazyFileRoute('/room')({
    component: Room,
});

enum ErrorCode {
    None = 1005,
    NotFound = 4000,
    RoomFull = 4001,
    RoomNotSpecified = 4002,
}

function Room() {
    const [link, setLink] = useState('Loading...');
    const [roomId, setRoomID] = useState('');
    const [log, setLog] = useState('Log:\n');

    function newRoomId(roomId: string) {
        console.log("Room ID: " + roomId);
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
        }).then((res) => res.text())
        .then(newRoomId);
    }

    useEffect(() => {
        getRoomId();
    }, []);

    function onClose(event: CloseEvent) {
        setLink('Connecting...');
        const errorType = event.code as ErrorCode;
        // console.log(event);

        switch (errorType) {
            case ErrorCode.NotFound:
                Cookies.remove('room_id');
                getRoomId();
                break;

            default:
                break;
        }
    }

    const { sendMessage, lastMessage, readyState } = useWebSocket(
        'ws://localhost:5000/' + roomId,
        {
            onOpen: (event: Event) => {
                console.log(event);
                setLog('');
                setLink('http://localhost:5000/room/' + roomId);
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
                <button onClick={() => sendMessage(`ping (${new Date().toLocaleTimeString()})`)}>Send ping</button>
                <hr />
                <p>Send this link to someone:</p>
                <p>{link}</p>
                <pre>{log}</pre>
                <hr />
                
            </div>
        </div>
    );
}
