import {
    Spotify,
    TGenreMapping,
    TGenrePlaylist,
    TSongInfoCollection,
} from '../../src/common_types/spotify_types';
import { sleep, capitalize } from './helpers';
import { reduceToSongInfo } from './spotify_helpers';

export class SpotifyClient {
    readonly baseUrl = 'https://api.spotify.com/v1';
    readonly authInfo: Spotify.AuthInfo;
    readonly invalidTokenCallback: () => void;
    private meTracksLock: boolean = false;

    constructor(authInfo: Spotify.AuthInfo, invalidTokenCallback: () => void) {
        this.authInfo = authInfo;
        this.invalidTokenCallback = invalidTokenCallback;
    }

    async fetch<T>(url: string, options?: RequestInit): Promise<T> {
        let response = await fetch(url, options);

        if (response.status === 401) {
            this.invalidTokenCallback();
            return Promise.reject('Invalid token');
        }

        // Backoff-retry strategy for 429 quota exceeded
        while (response.status === 429) {
            let retryAfter = response.headers.get('Retry-After');
            if (!retryAfter) retryAfter = '10';
            await sleep(parseInt(retryAfter) * 1000);
            response = await fetch(url, options);
        }

        if (response.status != 200 && response.status != 201)
            return Promise.reject('Spotify API error!');

        return response.json();
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
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.authInfo.access_token}`,
            },
            body: JSON.stringify(data),
        });
    }

    async getMe(): Promise<Spotify.User> {
        return this.get<Spotify.User>(`${this.baseUrl}/me`);
    }

    // Loads all the user's liked songs 
    async loadAllMeTracks(
        newDataCallback: (
            songs: TSongInfoCollection,
            genres: TGenreMapping,
        ) => void,
        finalCallback: () => void,
        setFetchedSongCount: any,
        setTotalSongCount: any,
    ) {
        // Prevent multiple calls to this function
        if (this.meTracksLock) return;
        this.meTracksLock = true;

        // Fetch the songs in chunks of 50
        let nextUrl = `${this.baseUrl}/me/tracks?limit=50`;
        while (nextUrl) {
            // Get songs
            const response =
                await this.get<Spotify.Response<Spotify.Track>>(nextUrl);

            // For progress bar
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

            // Fetch all the artists for the chunk, needed for genre info
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

        // Get user profile, required for creating a playlist
        const userProfile = await this.getMe();

        // Create the playlist (empty for now)
        const url = `${this.baseUrl}/users/${userProfile.id}/playlists`;
        const postBody = {
            name: name,
            description: 'Exported from Merge Your Music',
            public: true,
        };

        const spotifyPlaylist = await this.post<Spotify.Playlist>(
            url,
            postBody,
        );

        let chunk: string[] = [];

        // Add tracks to the playlist in chunks of 100 (the max allowed by Spotify's API)
        for (let i = 0; i < playlist.list.length; i++) {
            const el = playlist.list[i];
            chunk.push(el.uri);
            if (chunk.length == 100 || i == playlist.list.length - 1) {
                const data = {
                    uris: chunk,
                    position: 0,
                };

                await this.post<any>(
                    `${this.baseUrl}/playlists/${spotifyPlaylist.id}/tracks`,
                    data,
                );
                chunk = [];
            }
        }

        // Open the playlist in spotify in a new tab
        window.open(spotifyPlaylist.external_urls.spotify, '_blank');
    }
}
