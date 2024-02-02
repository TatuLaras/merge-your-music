export interface TSpotifyAuthInfo {
    access_token: string;
    refresh_token: string;
}

export interface TSpotifyImage {
    height: number;
    url: string;
    width: number;
}

export interface TSpotifyUser {
    display_name: string;
    id: string;
    images: TSpotifyImage[];
    external_urls: { spotify: string };
}

export interface TSpotifyResponse<T> {
    href: string;
    items: T[];
    limit: number;
    next: string;
    offset: number;
    previous: string;
    total: number;
}

export interface TSpotifyTrack {
    added_at: string;
    track: TSpotifyTrackInfo;
}

export interface TSpotifyTrackInfo {
    album: TSpotifyAlbum;
    artists: TSpotifyArtistShort[];
    available_markets: string[];
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    external_ids: { isrc: string };
    external_urls: { spotify: string };
    href: string;
    id: string;
    is_local: boolean;
    name: string;
    popularity: number;
    preview_url: string;
    track_number: number;
    type: 'track';
    uri: string;
}

export interface TSpotifyAlbum {
    album_type: string;
    artists: TSpotifyArtistShort[];
    available_markets: string[];
    external_urls: { spotify: string };
    href: string;
    id: string;
    images: TSpotifyImage[];
    name: string;
    release_date: string;
    release_date_precision: string;
    total_tracks: number;
    type: 'album';
    uri: string;
}

export interface TSpotifyArtistShort {
    external_urls: { spotify: string };
    href: string;
    id: string;
    name: string;
    type: 'artist';
    uri: string;
}

export interface TSpotifyArtist extends TSpotifyArtistShort {
    followers: { href: string; total: number };
    genres: string[];
    images: TSpotifyImage[];
    popularity: number;
}

export interface TAlbumInfo {
    name: string;
    release_date: string;
    image: string;
    id: string;
    external_url: string;
    artists: TArtistInfo[];
}

export interface TArtistInfo {
    name: string;
    external_url: string;
    id: string;
}

// More minimal version of TrackInfo, for space efficiency
export interface TSongInfo {
    name: string;
    artists: TArtistInfo[];
    duration_ms: number;
    external_url: string;
    preview_url: string;
    album: TAlbumInfo;
}

export interface TSongInfoCollection {
    [songId: string]: TSongInfo;
}
export interface TGenreMapping {
    [artistId: string]: string[];
}

export interface TMusicData {
    songs: TSongInfoCollection;
    genres: TGenreMapping;
}

export interface TGenrePlaylist {
    genre: string;
    list: TSongInfo[];
}
