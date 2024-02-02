import { useEffect, useState } from 'react';
import {
    TGenrePlaylist,
    TMusicData,
} from '../../../src/common_types/spotify_types';
import { generateGenrePlaylists } from '../spotify_helpers';
import { PlaylistDetails } from './PlaylistDetails';
import { PlaylistCard } from './PlaylistCard';

import { isChrome } from 'react-device-detect';

export function Results({ musicData }: { musicData: TMusicData }) {
    const [genrePlaylists, setGenrePlaylists] = useState<TGenrePlaylist[]>([]);
    const [inspectedPlaylist, setInspectedPlaylist] =
        useState<TGenrePlaylist | null>(null);
    const [playlistDetailsBg, setPlaylistDetailsBg] = useState<string>('');

    useEffect(() => {
        const lists = generateGenrePlaylists(musicData);
        console.log(lists);
        setGenrePlaylists(lists);
    }, []);

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

    return (
        <>
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
                                    playlist.list[i % playlist.list.length]
                                        .album.image
                                }
                                setInspectedPlaylist={() => {
                                    setPlaylistDetailsBg(
                                        playlist.list[i % playlist.list.length]
                                            .album.image,
                                    );
                                    setInspectedPlaylist(playlist);
                                }}
                            />
                        ),
                    )}
                </div>
            </div>
        </>
    );
}
