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
            <section className='hero'>
                <h1>
                    Merge
                    <br />
                    Your
                    <br />
                    Music
                </h1>
                <a href={login_uri} className='main-login-button'>Login with Spotify</a>
            </section>
            <div className='fade'></div>
            <div className='content'>
                <h2>
                    Merge your music taste with someone else's!
                </h2>
                <p>
                    Login with Spotify and send a link to your friend to start generating plalists of music you both enjoy.
                </p>
                <a href={login_uri} className='main-login-button'>Login with Spotify</a>
            <footer>
                <div className="left">
                    <a href="#">Privacy policy</a>
                    <a href="#">Coffee</a>
                    <a href="https://www.laras.cc/">Developer homepage</a>
                    <a href="#">Project on Github</a>
                </div>
                <div className="right">
                    <p>© Tatu Laras 2024</p>
                    <p>tatu.laras@gmail.com</p>
                </div>
            </footer>
            </div>
        </div>
    );
}
