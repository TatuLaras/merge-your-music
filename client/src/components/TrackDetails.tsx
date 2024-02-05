import {
    TArtistInfo,
    TSongInfo,
} from '../../../src/common_types/spotify_types';
import { asCssUrl } from '../helpers';

export function TrackDetails({
    track,
    playPreviewAudio,
}: {
    track: TSongInfo;
    playPreviewAudio: (url: string) => void;
}) {
    function getArtists(artists: TArtistInfo[]) {
        return artists.map((artist) => artist.name).join(', ');
    }

    // playlist.list[0].album.image
    return (
        <div className='track'>
            <div
                style={asCssUrl(track.album.images[track.album.images.length - 1].url)}
                className='image'
                onClick={(e) => {
                    playPreviewAudio(track.preview_url);
                    document
                        .querySelectorAll('.currently-playing-track')
                        .forEach((el) =>
                            el.classList.remove('currently-playing-track'),
                        );
                    e.currentTarget.classList.add('currently-playing-track');
                }}
                title='Play preview'
            >
                <div className='play'>
                    <i className='fa-solid fa-play'></i>
                </div>
            </div>
            <div className='track-info'>
                <div className='name'>{track.name}</div>
                <div className='artists'>{getArtists(track.artists)}</div>
            </div>
            <div className='end'>
                <a href={track.external_url} target='_blank' title='Link to Spotify'>
                    <i className='fa-solid fa-arrow-up-right-from-square'></i>
                </a>
            </div>
        </div>
    );
}
