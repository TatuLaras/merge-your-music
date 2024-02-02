import {
    TGenrePlaylist,
} from '../../../src/common_types/spotify_types';
import { capitalize } from '../helpers';

export function PlaylistCard({
    playlist,
    playlistCoverUrl,
    setInspectedPlaylist,
}: {
    playlist: TGenrePlaylist;
    playlistCoverUrl: string,
    setInspectedPlaylist: (playlist: TGenrePlaylist) => void;
}) {
    return (
        <div
            key={playlist.genre}
            className='playlist-card'
            onClick={() => setInspectedPlaylist(playlist)}
        >
            <img
                src={playlistCoverUrl}
                alt='Playlist cover'
                draggable={false}
            />
            <div className='title'>{capitalize(playlist.genre)}</div>
            <div className='extra-info'>{playlist.list.length} tracks</div>
        </div>
    );
}
