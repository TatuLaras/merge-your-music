import {
    TGenreMapping,
    TGenrePlaylist,
    TSongInfoCollection,
    TSpotifyAuthInfo,
    TSpotifyResponse,
    TSpotifyTrack,
    TSpotifyUser,
} from '../../src/common_types/spotify_types';
import { sleep, capitalize } from './helpers';
import { reduceToSongInfo } from './spotify_helpers';

export class SpotifyClient {
    readonly baseUrl = 'https://api.spotify.com/v1';
    readonly authInfo: TSpotifyAuthInfo;
    readonly invalidTokenCallback: () => void;
    private shouldAbort = false;
    private abortedCallback: () => void = () => {};

    constructor(authInfo: TSpotifyAuthInfo, invalidTokenCallback: () => void) {
        this.authInfo = authInfo;
        this.invalidTokenCallback = invalidTokenCallback;
    }

    async fetch<T>(url: string, options?: RequestInit): Promise<T> {
        let response = await fetch(url, options);
        console.log(`Spotify fetch: ${url}`);
        
        if (response.status === 401) {
            this.invalidTokenCallback();
            return Promise.reject('Invalid token');
        }

        while (response.status === 429) {
            let retryAfter = response.headers.get('Retry-After');
            if (!retryAfter) retryAfter = '10';
            await sleep(parseInt(retryAfter) * 1000);
            response = await fetch(url, options);
        }

        if(response.status == 200 || response.status == 201) 
            return response.json();

        return Promise.reject('Error with Spotify Api');
        
    }

    async get<T>(url: string): Promise<T> {
        return this.fetch<T>(url, {
            headers: {
                Authorization: `Bearer ${this.authInfo.access_token}`,
            },
        });
    }

    async post<T>(url: string, data: any): Promise<T> {
        return this.fetch<T>(url, {
            method: "POST",
            headers:
            {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.authInfo.access_token}`,
            },
            body: JSON.stringify(data)
        });
    }

    async getMe(): Promise<TSpotifyUser> {
        return this.get<TSpotifyUser>(`${this.baseUrl}/me`);
    }

    async getMeTracks(): Promise<TSpotifyResponse<TSpotifyTrack>> {
        return this.get<TSpotifyResponse<TSpotifyTrack>>(
            `${this.baseUrl}/me/tracks`,
        );
    }

    private lock: boolean = false;

    async loadAllMeTracks(
        newDataCallback: (
            songs: TSongInfoCollection,
            genres: TGenreMapping,
        ) => void,
        finalCallback: () => void,
        setFetchedSongCount: any,
        setTotalSongCount: any,
    ) {
        if(this.lock) return;
        this.lock = true;

        console.log('moi');
        
        let nextUrl = `${this.baseUrl}/me/tracks?limit=50`;
        while (nextUrl) {
            if (this.shouldAbort) {
                console.log(`Aborting loadAllMeTracks`);
                this.shouldAbort = false;
                this.abortedCallback();
                return;
            }

            const response =
                await this.get<TSpotifyResponse<TSpotifyTrack>>(nextUrl);

            setTotalSongCount(response.total);

            const songs: TSongInfoCollection = {};
            const genres: TGenreMapping = {};

            const artistIdList: string[] = [];

            response.items.forEach((item) => {
                if (item.track.is_local) return;

                songs[item.track.id] = reduceToSongInfo(item);

                if (artistIdList.length < 50)
                    artistIdList.push(item.track.artists[0].id);
            });

            const artistIdStr = artistIdList.join(',');
            const artistResponse = await this.get<any>(
                `${this.baseUrl}/artists?ids=${artistIdStr}`,
            );

            artistResponse.artists.forEach((artist: any) => {
                if (artist.genres.length == 0) return;
                genres[artist.id] = artist.genres;
            });

            await newDataCallback(songs, genres);
            setFetchedSongCount((old: any) => old + response.items.length);
            nextUrl = response.next;
        }
        finalCallback();
    }

    async createPlaylist(playlist: TGenrePlaylist) {
        const name = capitalize(playlist.genre);
        const userProfile = await this.getMe();
        const url = `${this.baseUrl}/users/${userProfile.id}/playlists`;
        const postBody = {
            name: name,
            description: "Exported from Merge Your Music",
            public: true
        };
        await this.post<any>(url, postBody);

        // Add tracks ...
        
    }

}
