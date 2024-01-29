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