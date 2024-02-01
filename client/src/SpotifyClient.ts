import {
    TGenreMapping,
    reduceToSongInfo,
    TSongInfoCollection,
    TSpotifyAuthInfo,
    TSpotifyResponse,
    TSpotifyTrack,
    TSpotifyUser,
} from '../../src/common_types/spotify_types';
import { sleep } from './helpers';

export class SpotifyClient {
    readonly baseUrl = 'https://api.spotify.com/v1';
    readonly authInfo: TSpotifyAuthInfo;
    readonly invalidTokenCallback: () => void;
    private shouldAbort = false;
    private abortedCallback: () => void = () => {};
    private _jobRunning = false;
    public get jobRunning() {
        return this._jobRunning;
    }

    constructor(authInfo: TSpotifyAuthInfo, invalidTokenCallback: () => void) {
        this.authInfo = authInfo;
        this.invalidTokenCallback = invalidTokenCallback;
    }

    async fetch<T>(url: string, options?: RequestInit): Promise<T> {
        let response = await fetch(url, options);
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
            `${this.baseUrl}/me/tracks`,
        );
    }

    async loadAllMeTracks(
        newDataCallback: (
            songs: TSongInfoCollection,
            genres: TGenreMapping,
        ) => void,
        finalCallback: () => void,
        setFetchedSongCount: any,
        setTotalSongCount: any,
    ) {
        this._jobRunning = true;
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

    async abort(): Promise<void> {
        this.shouldAbort = true;
        this._jobRunning = false;
        return new Promise((resolve) => {
            this.abortedCallback = resolve;
        });
    }
}
