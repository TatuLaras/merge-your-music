import { SpotifyClient } from '../SpotifyClient';
import { useEffect, useState } from 'react';
import {
    TGenreMapping,
    TSongInfoCollection,
} from '../../../src/common_types/spotify_types';

export function LikedSongsLoading({
    spotifyClient,
    bothReady,
    doneCallback,
    addLikedSongsCallback,
}: {
    spotifyClient: SpotifyClient | null;
    bothReady: boolean;
    doneCallback: () => void;
    addLikedSongsCallback: (
        songs: TSongInfoCollection,
        genres: TGenreMapping,
    ) => void;
}) {
    const [fetchedSongCount, setFetchedSongCount] = useState<number>(0);
    const [totalSongCount, setTotalSongCount] = useState<number>(0);

    function getLikedSongs() {
        console.log('Getting liked songs');

        if (!spotifyClient) {
            alert('no spotify client!');
            return;
        }

        spotifyClient.loadAllMeTracks(
            addLikedSongsCallback,
            doneCallback,
            setFetchedSongCount,
            setTotalSongCount,
        );
    }

    useEffect(() => {
        if (bothReady) getLikedSongs();
    }, [bothReady]);

    const text = bothReady ? 'Ready' : 'Not ready';
    const loadingBarWidth = (fetchedSongCount / totalSongCount) * 100;
    const loadingBarStyle = {
        '--loading-bar-width': loadingBarWidth + '%',
    } as React.CSSProperties;
    return (
        <div className='songs-loading-status'>
            <p>{text}</p>
            <div className='loading-bar' style={loadingBarStyle}>
                <div className='inner'></div>
            </div>
        </div>
    );
}