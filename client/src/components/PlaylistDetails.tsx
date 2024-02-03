import { useState } from 'react';
import {
    TGenrePlaylist,
    TSongInfo,
} from '../../../src/common_types/spotify_types';
import { SpotifyClient } from '../SpotifyClient';
import { asCssUrl, capitalize } from '../helpers';

import { TrackDetails } from './TrackDetails';

export function PlaylistDetails({
    playlist,
    playlistCoverUrl,
    onCloseDetails,
    playPreviewAudio,
    spotifyClient,
}: {
    playlist: TGenrePlaylist;
    playlistCoverUrl: string;
    onCloseDetails: () => void;
    playPreviewAudio: (url: string) => void;
    spotifyClient: SpotifyClient | null;
}) {
    const [addToSpotifyLock, setAddToSpotifyLock] = useState<boolean>(false);

    return (
        <div className='playlist-details-wrapper' id='details'>
            <div className='playlist-details'>
                <div className='header' style={asCssUrl(playlistCoverUrl)}>
                    <h1 className='title'>{capitalize(playlist.genre)}</h1>
                    <div className='buttons'>
                        <div
                            className='close cursor-pointer'
                            onClick={onCloseDetails}
                            title='Close'
                        >
                            <i className='fa-solid fa-x'></i>
                        </div>
                        {addToSpotifyLock ? (
                            <div className='save-to-spotify disabled'>
                                <i className='fa-brands fa-spotify'></i>
                            </div>
                        ) : (
                            <div
                                className='save-to-spotify cursor-pointer'
                                onClick={async () => {
                                    setAddToSpotifyLock(true);
                                    await spotifyClient?.createPlaylist(
                                        playlist,
                                    );
                                    setAddToSpotifyLock(false);
                                }}
                                title='Save to Spotify'
                            >
                                <i className='fa-brands fa-spotify'></i>
                            </div>
                        )}
                    </div>
                    <div className='track-count'>
                        {playlist.list.length} tracks
                    </div>
                </div>
                <div className='tracks'>
                    {playlist.list.map((track: TSongInfo, i: number) => (
                        <TrackDetails
                            track={track}
                            key={i}
                            playPreviewAudio={playPreviewAudio}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
