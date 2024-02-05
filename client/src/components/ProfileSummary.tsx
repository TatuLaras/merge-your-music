import { useEffect, useState } from 'react';
import { Spotify } from '../../../src/common_types/spotify_types';
import Cookies from 'js-cookie';

export function ProfileSummary({
}: {
}) {
    const [profile, setProfile] = useState<Spotify.User | null>(null);

    function getProfileFromCookie() {
        setProfile(JSON.parse(Cookies.get("other_profile")!))
    }

    useEffect(() => {
        getProfileFromCookie();
    }, []);

    return (
        profile &&
        <div className='user-profile'>
            <img src={profile.images[0].url}
            draggable="false" alt='Spotify profile picture'/>
            <div className='name'>{profile.display_name}</div>
        </div>
    );
}
