"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpotifyClient = void 0;
class SpotifyClient {
    baseUrl = 'https://api.spotify.com/v1';
    authInfo;
    invalidTokenCallback;
    constructor(authInfo, invalidTokenCallback) {
        this.authInfo = authInfo;
        this.invalidTokenCallback = invalidTokenCallback;
    }
    async fetch(url, options) {
        const response = await fetch(url, options);
        if (response.status === 401) {
            this.invalidTokenCallback();
            return Promise.reject('Invalid token');
        }
        return response.json();
    }
    async get(url) {
        return this.fetch(url, {
            headers: {
                Authorization: `Bearer ${this.authInfo.access_token}`,
            },
        });
    }
    async getMe() {
        return this.get(`${this.baseUrl}/me`);
    }
    async getMeTracks() {
        return this.get(`${this.baseUrl}/me/tracks`);
    }
}
exports.SpotifyClient = SpotifyClient;
