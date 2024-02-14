import { Link, createLazyFileRoute } from '@tanstack/react-router';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';

export const Route = createLazyFileRoute('/')({
    component: Index,
});

function Index() {
    const [cookieConsent, setCookieConsent] = useState<boolean>(false);
    const login_uri: string = `/spotify_login`;

    const tokens = Cookies.get('own_tokens');
    if (tokens) window.location.replace('/room');

    useEffect(() => {
        const tokens = Cookies.get('own_tokens');
        if (tokens) window.location.replace('/room');

        Cookies.get('cookie_consent') === 'true' && setCookieConsent(true);
    }, []);

    function cookieAgree() {
        setCookieConsent(true);
        Cookies.set('cookie_consent', 'true', { expires: 365 });
    }

    return (
        <div className='wrapper' id='index'>
            {!cookieConsent && (
                <div className='cookie-modal'>
                    <div className='text'>
                        <div className='title'>
                            By using this site you agree to our{' '}
                            <Link to='/privacy'>
                                privacy policy and cookie policy
                            </Link>
                            .
                        </div>
                        <div className='extra'>
                            Cookies are needed for certain site functionality,
                            we do not use them for tracking purposes.
                        </div>
                    </div>
                    <button className='agree' onClick={cookieAgree}>Agree</button>
                </div>
            )}
            <section className='hero'>
                <h1>
                    Merge
                    <br />
                    Your
                    <br />
                    Music
                </h1>
                <a href={login_uri} className='main-login-button'>
                    Login with Spotify
                </a>
            </section>
            <div className='fade'></div>
            <div className='content'>
                <h2>Merge your music taste with someone else's!</h2>
                <p>
                    <a href={login_uri} className='text-link'>
                        Login with Spotify
                    </a>{' '}
                    and send a link to your friend to start generating plalists
                    from music you both enjoy.
                </p>
                <a href={login_uri} className='main-login-button'>
                    Login with Spotify
                </a>
                <footer>
                    <div className='left'>
                        <a href='/privacy'>Privacy policy and cookie policy</a>
                        <a href='https://www.laras.cc/'>Developer homepage</a>
                        <a href='https://github.com/TatuLaras/merge-your-music'>
                            Project on Github
                        </a>
                        <a href='https://ko-fi.com/tatularas'>
                            Help me keep the website running!
                        </a>
                    </div>
                    <div className='right'>
                        <p>© Tatu Laras 2024</p>
                        <p>tatu.laras@gmail.com</p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
