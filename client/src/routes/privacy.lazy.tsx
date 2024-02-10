import { Link, createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/privacy')({
    component: Privacy,
});

function Privacy() {
    return (
        <div className='wrapper' id='privacy'>
            <div className='content'>
                <Link to='/'>Back to home page</Link>
                <h1>Privacy policy</h1>
                <h2>What we collect</h2>
                <p>
                    We collect your Spotify username and profile picture to
                    display on the website. We also collect your music taste
                    data to generate playlists. This data is stored in your
                    browser's local storage, not on our servers. We do not
                    collect any other data from you.
                </p>

                <h1>Cookie policy</h1>
                <p>
                    Cookies are needed for certain functionality of the site,
                    such as storing the application state (room id, music data,
                    etc.) and your Spotify OAuth tokens. We do not use cookies for
                    tracking or analytics.
                </p>
            </div>
        </div>
    );
}
