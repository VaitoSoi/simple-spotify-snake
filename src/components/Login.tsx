import Snake from '@/icons/Snake.svg';
import Spotify from '@/icons/Spotify.svg';
import { DefaultScope, RedirectURI } from '@/lib/api';
import { base64Encode, generateRandomString, sha256 } from '@/lib/utils';
import { useState } from 'react';

export default function () {
    const [clientId, setClientId] = useState<string>(localStorage.getItem('client-id') || "");

    async function login() {
        let codeVerifier = localStorage.getItem('verifier');
        if (!codeVerifier) {
            codeVerifier = generateRandomString(64);
            localStorage.setItem('verifier', codeVerifier);
        }
        const state = base64Encode(await sha256(generateRandomString(64)));
        localStorage.setItem('state', state);

        localStorage.setItem('client-id', clientId);

        const hashed = await sha256(codeVerifier);
        const codeChallenge = base64Encode(hashed);

        const params = {
            response_type: 'code',
            client_id: clientId,
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
        <div className="m-auto flex rounded-2xl xl:h-2/3 xl:w-1/3 xl:border-4 border-black">
            <div className="w-full m-auto flex flex-col items-center gap-2">
                <img src={Snake} alt="Snake" className='size-30' />
                <p className="font-bold text-3xl">Simple Snake Game</p>
                <p className='mt-10 text-xl w-4/5 text-center xl:w-full'><a
                    href="https://github.com/vaitosoi/simple-spotify-snake/blob/main/docs/CREATE_APP.md"
                    className='text-blue-600 hover:underline'
                >Create your Spotify app</a>, then put your Client ID here</p>
                <input
                    className='rounded-md border-2 px-4 py-2 w-3/5 text-center'
                    value={clientId}
                    onChange={(event) => setClientId(event.target.value)}
                />
                <p className='mt-5 text-xl'>Then click this</p>
                <button
                    className={"bg-[#1ed760] flex flex-row items-center gap-2 px-10 py-3 rounded-2xl text-white text-xl " + (!clientId ? "cursor-not-allowed" : "cursor-pointer")}
                    onClick={() => login()}
                    disabled={!clientId}
                >
                    <img src={Spotify} className='size-10' />
                    Log in with Spotify
                </button>
            </div>
        </div>
    </div>;
}
