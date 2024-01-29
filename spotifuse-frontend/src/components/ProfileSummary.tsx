import { TSpotifyUser } from '../../../src/common_types/spotify_types';

export function ProfileSummary({
    userProfile,
}: {
    userProfile: TSpotifyUser | null;
}) {
    if (!userProfile) return null;
    return (
        <div className='profile'>
            <img src={userProfile.images[userProfile.images.length - 1].url} />
            <h2>{userProfile.display_name}</h2>
        </div>
    );
}
