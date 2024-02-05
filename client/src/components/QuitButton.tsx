
import Cookies from 'js-cookie';

export function QuitButton({
}: {
}) {
    function quitSession() {
        Cookies.remove('room_id');
        Cookies.remove('own_tokens');
        Cookies.remove('other_profile');
        localStorage.clear();
        window.location.replace('/');
    }

    return (
        <div className="quit-button" onClick={quitSession}>Quit</div>
    );
}
