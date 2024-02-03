import {
    Spotify,
    TGenrePlaylist,
    TMusicData,
    TSongInfo,
} from '../../src/common_types/spotify_types';

import { shuffle } from './helpers'

// Maps TSpotifyTrack to a simpler TSongInfo
export function reduceToSongInfo(item: Spotify.Track): TSongInfo {
    return {
        name: item.track.name,
        artists: item.track.artists.map((artist) => {
            return {
                name: artist.name,
                id: artist.id,
                external_url: artist.external_urls.spotify,
            };
        }),
        duration_ms: item.track.duration_ms,
        external_url: item.track.external_urls.spotify,
        preview_url: item.track.preview_url,
        album: {
            name: item.track.album.name,
            release_date: item.track.album.release_date,
            image: item.track.album.images[0].url,
            id: item.track.album.id,
            external_url: item.track.album.external_urls.spotify,
            artists: item.track.album.artists.map((artist) => {
                return {
                    name: artist.name,
                    id: artist.id,
                    external_url: artist.external_urls.spotify,
                };
            }),
        },
    } as TSongInfo;
}

// Generates a list of playlists, each containing songs of a certain genre
export function generateGenrePlaylists(
    musicData: TMusicData,
): TGenrePlaylist[] {
    let collection: {
        [genre: string]: { [songId: string]: TSongInfo };
    } = {};

    // Populate collection, object used to ensure no duplicate songs or genres
    Object.keys(musicData.songs).forEach((songId) => {
        const song: TSongInfo = musicData.songs[songId];
        song.artists.forEach((artist) => {
            const genres = musicData.genres[artist.id];
            if (!genres) return;
            genres.forEach((genre) => {
                if (!(genre in collection)) collection[genre] = {};
                collection[genre][songId] = song;
            });
        });
    });

    // Convert collection to array

    let result: TGenrePlaylist[] = [];

    Object.keys(collection).forEach((genre) => {
        result.push({
            genre: genre,
            list: Object.values(collection[genre]),
        });
    });


    // Filter out playlists with too few songs
    result = result.filter((item) => item.list.length >= 10);

    // Sort by playlist length
    result.sort((a, b) => {
        return b.list.length - a.list.length;
    });

    // Shuffle each playlist
    result = result.map(playlist => {
        playlist.list = shuffle(playlist.list)
        return playlist
    }) as TGenrePlaylist[];

    return result;
}
