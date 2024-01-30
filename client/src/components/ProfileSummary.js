"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileSummary = void 0;
function ProfileSummary({ userProfile, }) {
    if (!userProfile)
        return null;
    return (<div className='profile'>
            <img src={userProfile.images[userProfile.images.length - 1].url}/>
            <h2>{userProfile.display_name}</h2>
        </div>);
}
exports.ProfileSummary = ProfileSummary;
