import { useNavigate, useSearchParams } from "react-router";
import Error from "./Error";
import { useEffect, useState } from "react";
import { RedirectURI } from "@/lib/api";
import axios from "axios";

export default function () {
    const [error, setError] = useState<string>();
    const [searchParams] = useSearchParams();
    const navigator = useNavigate();
    const clientId = localStorage.getItem("client-id");

    useEffect(() => void auth(), []);
    async function auth() {
        if (!clientId)
            return setError("Client ID is not set");

        const code = searchParams.get('code'),
            expectState = localStorage.getItem('state'),
            gotState = searchParams.get('state');

        if (!code)
            return setError('"code" parameter is not provided');

        if (!expectState || gotState != expectState)
            return setError("Mismatch state");

        // stored in the previous step
        const codeVerifier = localStorage.getItem('verifier');
        if (!codeVerifier)
            return setError("Missing token");

        const url = "https://accounts.spotify.com/api/token";
        try {
            const response = await axios.post(
                url,
                {
                    client_id: clientId,
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: RedirectURI,
                    code_verifier: codeVerifier,
                },
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );
            localStorage.setItem('token', response.data.access_token);
        } catch (err) {
            console.error(err);
            setError("An error occured while fetching your token, try again later.");
        }
        localStorage.removeItem('verifier');
        localStorage.removeItem('state');

        navigator("/");
    }

    return <>{error && <Error error={error} />}</>;
}