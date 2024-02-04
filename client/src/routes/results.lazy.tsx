import { createLazyFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { SpotifyClient } from '../SpotifyClient';
import {
    Spotify,
    TMusicData,
    TGenrePlaylist,
} from '../../../src/common_types/spotify_types';
import { parse } from 'zipson';

import { QuitButton } from '../components/QuitButton';

import { PlaylistDetails } from '../components/PlaylistDetails';
import { generateGenrePlaylists } from '../spotify_helpers';
import { isChrome } from 'react-device-detect';
import { PlaylistCard } from '../components/PlaylistCard';
import { ProfileSummary } from '../components/ProfileSummary';

import spotifyLogo from '../assets/Spotify_Logo.png';

export const Route = createLazyFileRoute('/results')({
    component: Results,
});

function Results() {
    const [spotifyClient, setSpotifyClient] = useState<SpotifyClient | null>(
        null,
    );

    const [genrePlaylists, setGenrePlaylists] = useState<TGenrePlaylist[]>([]);
    const [inspectedPlaylist, setInspectedPlaylist] =
        useState<TGenrePlaylist | null>(null);
    const [playlistDetailsBg, setPlaylistDetailsBg] = useState<string>('');
    const [userProfile, setUserProfile] = useState<Spotify.User | null>(null);

    const pointerEvents: React.CSSProperties = inspectedPlaylist
        ? { pointerEvents: 'none', overflowY: 'hidden' }
        : { pointerEvents: 'inherit', overflow: 'inherit' };

    if (inspectedPlaylist) {
        document.body.style.overflow = 'hidden';
        if (isChrome)
            document.body.style.paddingRight = 'var(--scrollbar-width)';
    } else {
        document.body.style.paddingRight = '0';
        document.body.style.overflow = 'auto';
    }

    useEffect(() => {
        // Check for cached music data, if found, use it
        const compressed = localStorage.getItem('musicData');
        if (!compressed) return; // otherwise redirect

        const musicData = parse(compressed) as TMusicData;
        const lists = generateGenrePlaylists(musicData);
        setGenrePlaylists(lists);

        // Get Spotify auth info from cookies, redirect to login if none
        const tokens = Cookies.get('own_tokens');
        if (!tokens)
            window.location.replace(
                `${import.meta.env.VITE_BACKEND_BASE_URL}/spotify_login`,
            );
        const authInfo: Spotify.AuthInfo = JSON.parse(tokens!);
        setSpotifyClient(
            new SpotifyClient(authInfo, () => {
                // Invalid token handler
                Cookies.remove('own_tokens');
                window.location.replace(
                    `${import.meta.env.VITE_BACKEND_BASE_URL}/spotify_login`,
                );
            }),
        );
    }, []);

    useEffect(() => {
        if (!spotifyClient) return;
        // TODO other user, not self
        spotifyClient.getMe().then((user) => setUserProfile(user));
    }, [spotifyClient]);

    return (
        <div className='wrapper' id='results'>
            <div className='content'>
                <div className='top'>
                    <QuitButton />
                    <div className='end'>
                        <img
                            src={spotifyLogo}
                            alt='Spotify logo'
                            draggable='false'
                            className='logo'
                        />
                        <ProfileSummary userProfile={userProfile} />
                    </div>
                </div>
                {inspectedPlaylist && (
                    <PlaylistDetails
                        playlist={inspectedPlaylist}
                        playlistCoverUrl={playlistDetailsBg}
                        onCloseDetails={() => {
                            setInspectedPlaylist(null);
                            const audioPlayer = document.getElementById(
                                'audio-player',
                            ) as HTMLAudioElement;
                            audioPlayer.pause();
                        }}
                        playPreviewAudio={(url: string) => {
                            const audioPlayer = document.getElementById(
                                'audio-player',
                            ) as HTMLAudioElement;
                            audioPlayer.src = url;
                            audioPlayer.load();
                            audioPlayer.play();
                        }}
                        spotifyClient={spotifyClient}
                    />
                )}
                <audio id='audio-player'>
                    <source src='' type='audio/mpeg' />
                </audio>
                <div className='playlists' style={pointerEvents}>
                    <div className='genres'>
                        {genrePlaylists.map(
                            (playlist: TGenrePlaylist, i: number) => (
                                <PlaylistCard
                                    key={i}
                                    playlist={playlist}
                                    playlistCoverUrl={
                                        playlist.list[0].album.image
                                    }
                                    setInspectedPlaylist={() => {
                                        setPlaylistDetailsBg(
                                            playlist.list[0].album.image,
                                        );
                                        setInspectedPlaylist(playlist);
                                    }}
                                />
                            ),
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
