import Snake from '@/icons/Snake.svg';
import Spotify from '@/icons/Spotify.svg';
import { ClientID, DefaultScope, RedirectURI } from '@/lib/api';
import { base64Encode, generateRandomString, sha256 } from '@/lib/utils';

export default function () {
    async function login() {
        let codeVerifier = localStorage.getItem('verifier');
        if (!codeVerifier) {
            codeVerifier = generateRandomString(64);
            localStorage.setItem('verifier', codeVerifier);
        }
        const state = base64Encode(await sha256(generateRandomString(64)));
        localStorage.setItem('state', state);

        const hashed = await sha256(codeVerifier);
        const codeChallenge = base64Encode(hashed);

        const params = {
            response_type: 'code',
            client_id: ClientID,
            scope: DefaultScope,
            code_challenge_method: 'S256',
            code_challenge: codeChallenge,
            redirect_uri: RedirectURI,
            state
        };
        const url = new URL(`https://accounts.spotify.com/authorize`);
        url.search = new URLSearchParams(params).toString();
        window.location.href = url.toString();
    }

    return <div className="w-screen h-screen flex bg-white">
        <div className="m-auto flex rounded-2xl h-2/3 w-1/3 bg-gray-700">
            <div className="m-auto flex flex-col items-center">
                <img src={Snake} alt="Snake" className='size-30' />
                <p className="text-white font-bold text-3xl">Simple Snake Game</p>
                <button
                    className=" bg-[#1ed760] flex flex-row items-center gap-2 px-10 py-3 rounded-2xl text-white text-xl mt-20 cursor-pointer"
                    onClick={() => login()}
                >
                    <img src={Spotify} className='size-10' />
                    Log in with Spotify
                </button>
            </div>
        </div>
    </div>;
}
