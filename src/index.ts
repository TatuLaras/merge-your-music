import { FakeStoreService } from './FakeStoreService.js';
import { Spotify } from './Spotify.js';
import { StoreService } from './StoreService.js';
import { randomString } from './helpers.js';
var cors = require('cors');

const asyncHandler = require('express-async-handler');

require('dotenv').config();
const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);
app.use(cors());

const cookieParser = require('cookie-parser');
const session = require('express-session');

const store: StoreService = new FakeStoreService();
const spotify: Spotify.Client = new Spotify.Client();

app.use(cookieParser());
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
    })
);

interface TRoom {
    created: Date;
    connections: any[];
}

let openConnections = new Map<string, TRoom>();

app.ws('/', function (ws: any, req: any) {
    ws.close(4002, 'Room id not specified.');
});

app.ws('/:id', function (ws: any, req: any) {
    console.log('Connection attempt');

    const roomId = req.params.id;
    if (roomId.length == 0 || !openConnections.has(roomId)) {
        ws.close(4000, 'Room not found.');
        return;
    }

    const room = openConnections.get(roomId)!;

    if (room.connections.length >= 2) {
        ws.close(4001, 'Room is full.');
        return;
    }

    room.connections.push(ws);

    console.log(
        `Connection opened, room: ${roomId}, ${room.connections.length} connections.`
    );

    ws.on('message', function (msg: any) {
        console.log(`[${req.params.id}] Received: ${msg}`);
        room?.connections.forEach((client: any) => {
            if (client == ws) return;
            client.send(`[${req.params.id}] ${msg}`);
        });
    });
    ws.on('close', function () {
        room.connections = room.connections.filter((conn) => conn != ws);
        console.log(`Connection closed, room: ${roomId}, ${room.connections.length} connections.`);
    });
});

app.get('/spotify_login/:type', (req: any, res: any) => {
    let type = req.params.type;
    if (type != 'initial' && type != 'second') {
        res.status(404);
        res.send('404 Not Found');
        return;
    }

    const redirect_uri: string =
        type == 'initial'
            ? process.env.SPOTIFY_REDIRECT_URI_INITIAL!
            : process.env.SPOTIFY_REDIRECT_URI_SECOND!;

    const login_url = spotify.getLoginUrl(redirect_uri);

    res.redirect(login_url);
});

app.get(
    '/spotify_callback/initial',
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
            process.env.SPOTIFY_REDIRECT_URI_INITIAL!
        );

        if (!token) {
            res.status(500);
            res.send('Authentication failed.');
            return;
        }

        res.cookie('own_tokens', JSON.stringify(token));
        res.redirect(process.env.FINAL_REDIRECT_URI_INITIAL);
    })
);

app.post('/new_room', (req: any, res: any) => {
    const id_lenght = 12;
    let room_id = randomString(id_lenght);
    while (openConnections.has(room_id)) room_id = randomString(id_lenght);

    openConnections.set(room_id, { created: new Date(), connections: [] });
    console.log(openConnections);
    res.send(room_id);

    // Cleanup room ids
    roomsCleanup();
});

app.get('/room/:id', (req: any, res: any) => {
    const roomId = req.params.id;
    if (!openConnections.has(roomId)) {
        res.status(404);
        res.send('404 Not Found (Invalid room URL).');
        return;
    }

    res.cookie('room_id', roomId);
    res.redirect('/spotify_login/initial');
});

app.listen(process.env.BACKEND_PORT, () => {
    console.log(`Spotifuse listening on port ${process.env.BACKEND_PORT}`);
});

function roomsCleanup() {
    openConnections.forEach((room, id) => {
        if (
            room.created.getTime() <
            new Date().getTime() - 1000 * 60 * 60 * 24
        ) {
            openConnections.delete(id);
        }
    });
}
