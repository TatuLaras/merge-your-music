import {
    TGenrePlaylist,
    TSongInfo,
} from '../../../src/common_types/spotify_types';
import { asCssUrl, capitalize } from '../helpers';

import { TrackDetails } from './TrackDetails';

export function PlaylistDetails({
    playlist,
    playlistCoverUrl,
    onCloseDetails,
    playPreviewAudio,
}: {
    playlist: TGenrePlaylist;
    playlistCoverUrl: string;
    onCloseDetails: () => void;
    playPreviewAudio: (url: string) => void;
}) {
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
                        <div
                            className='save-to-spotify cursor-pointer'
                            onClick={onCloseDetails}
                            title='Save to Spotify'
                        >
                            <i className='fa-brands fa-spotify'></i>
                        </div>
                    </div>
                </div>
                <div className='tracks'>
                    {playlist.list.map((track: TSongInfo, i: number) => (
                        <TrackDetails track={track} key={i} playPreviewAudio={playPreviewAudio} />
                    ))}
                </div>
                {/* <button onClick={onCloseDetails}>Close</button> */}
            </div>
        </div>
    );
}
