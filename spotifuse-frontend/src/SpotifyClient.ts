import {
    TSpotifyAuthInfo,
    // TSpotifyImage,
    TSpotifyUser,
} from '../../src/common_types/spotify_types';

export class SpotifyClient {
    readonly baseUrl = 'https://api.spotify.com/v1';
    readonly authInfo: TSpotifyAuthInfo;
    readonly invalidTokenCallback: () => void;

    constructor(authInfo: TSpotifyAuthInfo, invalidTokenCallback: () => void) {
        this.authInfo = authInfo;
        this.invalidTokenCallback = invalidTokenCallback;
    }

    async fetch<T>(url: string, options?: RequestInit): Promise<T> {
        const response = await fetch(url, options);
        if (response.status === 401) {
            this.invalidTokenCallback();
        }
        return response.json();
    }

    async get<T>(url: string): Promise<T> {
        return this.fetch<T>(url, {
            headers: {
                Authorization: `Bearer ${this.authInfo.access_token}`,
            },
        });
    }

    async getMe(): Promise<TSpotifyUser> {
        return this.get<TSpotifyUser>(`${this.baseUrl}/me`);
    }
}
