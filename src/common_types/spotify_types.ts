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
    images: Array<TSpotifyImage>;
    external_urls: { spotify: string };
}

export interface TSpotifyResponse<T> {
    href: string;
    items: Array<T>;
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
    artists: Array<TSpotifyArtistShort>;
    available_markets: Array<string>;
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
    artists: Array<TSpotifyArtistShort>;
    available_markets: Array<string>;
    external_urls: { spotify: string };
    href: string;
    id: string;
    images: Array<TSpotifyImage>;
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
    genres: Array<string>;
    images: Array<TSpotifyImage>;
    popularity: number;
}

export interface TSongData {
    name: string;
    artist: string;
}