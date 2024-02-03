import { Spotify } from './common_types/spotify_types';

export class SpotifyHelpers {
    getLoginUrl(redirect_uri: string): string | null {
        var scope: string =
            'user-read-private user-read-email user-library-read \
playlist-modify-public playlist-modify-private';

        const data: any = {
            response_type: 'code',
            client_id: process.env.SPOTIFY_CLIENT_ID,
            scope: scope,
            redirect_uri: redirect_uri,
            state: process.env.SPOTIFY_STATE,
        };
        return (
            'https://accounts.spotify.com/authorize?' +
            new URLSearchParams(data).toString()
        );
    }

    async getAccessToken(
        code: string,
        redirect_uri: string,
    ): Promise<Spotify.AuthInfo | null> {
        const data = {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code',
        };

        const basic = btoa(
            process.env.SPOTIFY_CLIENT_ID +
                ':' +
                process.env.SPOTIFY_CLIENT_SECRET,
        );

        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: 'Basic ' + basic,
            },
            body: new URLSearchParams(data),
        });

        const json_data: Spotify.AuthInfo =
            (await response.json()) as Spotify.AuthInfo;

        if (response.status != 200) return null;

        return {
            access_token: json_data.access_token,
            refresh_token: json_data.refresh_token,
        };
    }
}
