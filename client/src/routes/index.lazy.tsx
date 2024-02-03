import { createLazyFileRoute } from '@tanstack/react-router';
import Cookies from 'js-cookie';

export const Route = createLazyFileRoute('/')({
    component: Index,
});

function Index() {
    const login_uri: string = `${import.meta.env.VITE_BACKEND_BASE_URL}/spotify_login`;

    const tokens = Cookies.get('own_tokens');
    if (tokens) window.location.replace('/room');

    return (
        <div className='wrapper' id='index'>
            <div className='content'>
                <h1>Merge Your Music!</h1>
                <p>Login with Spotify to continue.</p>
                <a href={login_uri}>Login with Spotify</a>
                <hr />
            </div>
        </div>
    );
}
