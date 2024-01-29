import { createLazyFileRoute } from '@tanstack/react-router';
import Cookies from 'js-cookie';

import '../css/index.css';

export const Route = createLazyFileRoute('/')({
    component: Index,
});

function Index() {
    const login_uri: string = import.meta.env.VITE_AUTH_URI_INITIAL;
    
    const tokens = Cookies.get('own_tokens');

    if(tokens) window.location.replace('/about');
    
    return (
        <div className='wrapper' id='index'>
            <div className='content'>
                <h1>Spotifuse your music!</h1>
                <p>Login with Spotify to continue.</p>
                <a href={login_uri}>
                    Login with Spotify
                </a>
                <hr />
                {tokens}
            </div>
        </div>
    );
}
