"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = void 0;
const react_router_1 = require("@tanstack/react-router");
const react_1 = require("react");
const react_use_websocket_1 = __importDefault(require("react-use-websocket"));
const ws_types_1 = require("../../../src/common_types/ws_types");
const js_cookie_1 = __importDefault(require("js-cookie"));
const SpotifyClient_1 = require("../SpotifyClient");
const ProfileSummary_1 = require("../components/ProfileSummary");
exports.Route = (0, react_router_1.createLazyFileRoute)('/room')({
    component: Room,
});
function Room() {
    const [link, setLink] = (0, react_1.useState)('Connecting...');
    const [roomId, setRoomID] = (0, react_1.useState)('');
    const [log, setLog] = (0, react_1.useState)('');
    const [spotifyClient, setSpotifyClient] = (0, react_1.useState)(null);
    const [userProfile, setUserProfile] = (0, react_1.useState)(null);
    function newRoomId(roomId) {
        console.log('Room ID: ' + roomId);
        setRoomID(roomId);
        js_cookie_1.default.set('room_id', roomId);
    }
    function getRoomId() {
        const existingRoomId = js_cookie_1.default.get('room_id');
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
    (0, react_1.useEffect)(() => {
        getRoomId();
        const tokens = js_cookie_1.default.get('own_tokens');
        if (!tokens)
            window.location.replace('/');
        const authInfo = JSON.parse(tokens);
        setSpotifyClient(new SpotifyClient_1.SpotifyClient(authInfo, () => {
            // Invalid token handler
            js_cookie_1.default.remove('own_tokens');
            window.location.replace('/');
        }));
    }, []);
    function getProfile() {
        if (!spotifyClient) {
            alert('no spotify client!');
            return;
        }
        spotifyClient.getMe().then((profile) => {
            if (profile)
                setUserProfile(profile);
        });
    }
    function onClose(event) {
        setLink('Connecting...');
        const errorType = event.code;
        switch (errorType) {
            case ws_types_1.WsErrorCode.RoomNotFound:
                js_cookie_1.default.remove('room_id');
                getRoomId();
                break;
            case ws_types_1.WsErrorCode.RoomFull:
                js_cookie_1.default.remove('room_id');
                getRoomId();
                break;
            default:
                break;
        }
    }
    const { sendMessage, lastMessage } = (0, react_use_websocket_1.default)(
    //, readyState
    'ws://localhost:5000/' + roomId, {
        onOpen: () => {
            setLog('');
            setLink('http://localhost:5000/share/' + roomId);
        },
        onClose: onClose,
        shouldReconnect: () => true,
    });
    (0, react_1.useEffect)(() => {
        if (lastMessage) {
            setLog((old) => old + '\n' + lastMessage.data);
        }
    }, [lastMessage]);
    return (<div className='wrapper'>
            <div className='content'>
                <button onClick={() => sendMessage(`ping (${new Date().toLocaleTimeString()})`)}>
                    Send ping
                </button>
                <button onClick={getProfile}>Get profile</button>
                <hr />
                <p>Send this link to someone:</p>
                <p>{link}</p>
                <hr />
                <pre>{log}</pre>
                <ProfileSummary_1.ProfileSummary userProfile={userProfile}/>
            </div>
        </div>);
}
