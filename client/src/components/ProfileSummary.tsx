import { useEffect, useState } from 'react';
import { Spotify } from '../../../src/common_types/spotify_types';
import Cookies from 'js-cookie';

export function ProfileSummary({
}: {
}) {
    const [profile, setProfile] = useState<Spotify.User | null>(null);

    function getProfileFromCookie() {
        const profileCookie = Cookies.get("other_profile");
        if(!profileCookie) return;
        setProfile(JSON.parse(profileCookie))
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
