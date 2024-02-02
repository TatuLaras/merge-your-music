
import Cookies from 'js-cookie';

export function QuitButton({
}: {
}) {
    function quitSession() {
        Cookies.remove('room_id');
        localStorage.clear();
        window.location.href = '/';
    }

    return (
        <div className="quit-button" onClick={quitSession}>Quit</div>
    );
}
