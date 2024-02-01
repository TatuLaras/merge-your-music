import { TSongInfoCollection, TGenreMapping } from './spotify_types';

export enum WsErrorCode {
    None = 1005,
    RoomNotFound = 4000,
    RoomFull = 4001,
    RoomNotSpecified = 4002,
}

export enum WsMessageType {
    Ready,
    DataDone,
    DataReceived,
    Abort,
    Data,
    Ping,
}

export interface TWebsocketMessage {
    type: WsMessageType;
    data: any;
}

export interface TWebsocketDataPacket {
    songs: TSongInfoCollection;
    genres: TGenreMapping;
}

export function sendData(
    data: TWebsocketDataPacket,
    sendMessage: (msg: string) => void
) {
    const message: TWebsocketMessage = {
        type: WsMessageType.Data,
        data: data,
    };
    sendMessage(JSON.stringify(message));
}

export function sendDataReceivedConfirmation(
    sendMessage: (msg: string) => void
) {
    const message: TWebsocketMessage = {
        type: WsMessageType.DataReceived,
        data: null,
    };
    sendMessage(JSON.stringify(message));
}

export function sendAbort(sendMessage: (msg: string) => void) {
    const message: TWebsocketMessage = {
        type: WsMessageType.Abort,
        data: null,
    };
    sendMessage(JSON.stringify(message));
}