import { Spotify } from '../../../src/common_types/spotify_types';

export function ProfileSummary({
    userProfile,
}: {
    userProfile: Spotify.User | null;
}) {
    if (!userProfile) return null;
    return (
        <div className='user-profile'>
            <img src={userProfile.images[0].url}
            draggable="false" alt='Spotify profile picture'/>
            <div className='name'>{userProfile.display_name}</div>
        </div>
    );
}
