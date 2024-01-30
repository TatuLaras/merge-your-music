export enum WsErrorCode {
    None = 1005,
    RoomNotFound = 4000,
    RoomFull = 4001,
    RoomNotSpecified = 4002,
}

export enum WsMessageType {
    ReadyNotification,
    DataConfirmation,
    Data,
    Ping
}

export interface TWebsocketMessage {
    type: WsMessageType;
    data: any;
}
