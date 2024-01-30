import {
    TSpotifyAuthInfo,
    TSpotifyResponse,
    TSpotifyTrack,
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
            return Promise.reject('Invalid token');
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

    async getMeTracks(): Promise<TSpotifyResponse<TSpotifyTrack>> {
        return this.get<TSpotifyResponse<TSpotifyTrack>>(
            `${this.baseUrl}/me/tracks`
        );
    }

    async loadAllMeTracks(
        newDataCallback: (songs: object, genres: object) => void
    ) {
        let nextUrl = `${this.baseUrl}/me/tracks?limit=50`;
        while (nextUrl) {
            const response =
                await this.get<TSpotifyResponse<TSpotifyTrack>>(nextUrl);
            console.log(response);

            const songs: any = {};
            const artistIdList: string[] = [];
            const genres: any = {};

            response.items.forEach((item) => {
                songs[item.track.id] = item.track.name;
                if (artistIdList.length < 50)
                    artistIdList.push(item.track.artists[0].id);
            });

            const artistIdStr = artistIdList.join(',');
            const artistResponse = await this.get<any>(
                `${this.baseUrl}/artists?ids=${artistIdStr}`
            );

            artistResponse.artists.forEach((artist: any) => {
                genres[artist.id] = artist.genres;
            });

            newDataCallback(songs, genres);
            nextUrl = response.next;
        }
    }
}
