"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = void 0;
const react_router_1 = require("@tanstack/react-router");
const js_cookie_1 = __importDefault(require("js-cookie"));
require("../css/index.css");
exports.Route = (0, react_router_1.createLazyFileRoute)('/')({
    component: Index,
});
function Index() {
    const login_uri = import.meta.env.VITE_AUTH_URI_INITIAL;
    const tokens = js_cookie_1.default.get('own_tokens');
    if (tokens)
        window.location.replace('/room');
    return (<div className='wrapper' id='index'>
            <div className='content'>
                <h1>Spotifuse your music!</h1>
                <p>Login with Spotify to continue.</p>
                <a href={login_uri}>
                    Login with Spotify
                </a>
                <hr />
            </div>
        </div>);
}
