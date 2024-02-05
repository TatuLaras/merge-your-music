import { SpotifyHelpers } from './SpotifyHelpers';
import { randomString } from './helpers';
import {
    TWebsocketMessage,
    WsErrorCode,
    WsMessageType,
} from './common_types/ws_types';

var cors = require('cors');

const asyncHandler = require('express-async-handler');

require('dotenv').config();
const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);
app.use(cors());

const cookieParser = require('cookie-parser');
const session = require('express-session');

const spotify: SpotifyHelpers = new SpotifyHelpers();

app.use(cookieParser());
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
    }),
);

interface TRoom {
    created: Date;
    connections: any[];
}

let openConnections = new Map<string, TRoom>();

app.ws('/', function (ws: any, req: any) {
    ws.close(WsErrorCode.RoomNotSpecified, 'Room id not specified.');
});

app.ws('/:id', function (ws: any, req: any) {
    const roomId = req.params.id;
    if (roomId.length == 0 || !openConnections.has(roomId)) {
        ws.close(WsErrorCode.RoomNotFound, 'Room not found.');
        return;
    }

    const room = openConnections.get(roomId)!;

    if (room.connections.length >= 2) {
        ws.close(4001, 'Room is full.');
        return;
    }

    room.connections.push(ws);
    if (room.connections.length == 2) {
        room?.connections.forEach((client: any) =>
            client.send(
                JSON.stringify({
                    type: WsMessageType.Ready,
                    data: null,
                } as TWebsocketMessage),
            ),
        );
    }

    console.log(
        `[${roomId}] Open: ${room.connections.length} clients connected.`,
    );

    ws.on('message', function (msg: string) {
        room?.connections.forEach((client: any) => {
            if (client == ws) return;
            client.send(msg);
        });
    });
    ws.on('close', function () {
        room.connections = room.connections.filter((conn) => conn != ws);
        console.log(
            `[${roomId}] Close: ${room.connections.length} clients connected.`,
        );
    });
});

app.get('/spotify_login', (req: any, res: any) => {
    const login_url = spotify.getLoginUrl(process.env.SPOTIFY_REDIRECT_URI!);
    res.redirect(login_url);
});

app.get(
    '/spotify_callback',
    asyncHandler(async (req: any, res: any) => {
        let code: string | undefined = req.query.code;
        let state: string | undefined = req.query.state;
        if (!req.query.code || !state || state != process.env.SPOTIFY_STATE) {
            res.status(401);
            res.send(`Error (${req.query.error}).`);
            return;
        }

        let token = await spotify.getAccessToken(
            code!,
            process.env.SPOTIFY_REDIRECT_URI!,
        );

        if (!token) {
            res.status(500);
            res.send('Authentication failed.');
            return;
        }

        res.cookie('own_tokens', JSON.stringify(token));
        res.redirect(process.env.FINAL_REDIRECT_URI);
    }),
);

app.post('/new_room', (req: any, res: any) => {
    const id_lenght = 6;
    let room_id = randomString(id_lenght);
    while (openConnections.has(room_id)) {
        room_id = randomString(id_lenght);
    }

    openConnections.set(room_id, { created: new Date(), connections: [] });
    res.send(room_id);

    cleanupRoomIds();
});

app.get('/share/:id', (req: any, res: any) => {
    const roomId = req.params.id;
    if (!openConnections.has(roomId)) {
        res.status(404);
        res.send('404 Not Found (Invalid room URL).');
        return;
    }

    res.cookie('room_id', roomId);
    res.redirect(process.env.FINAL_REDIRECT_URI);
});

app.listen(process.env.PORT, () => {
    console.log(`Spotifuse listening on port ${process.env.PORT}`);
});

function cleanupRoomIds() {
    openConnections.forEach((room, id) => {
        if (
            room.created.getTime() <
            new Date().getTime() - 1000 * 60 * 60 // 1 hour
            && room.connections.length == 0
        ) {
            openConnections.delete(id);
        }
    });
}
