import { useEffect, useState } from "react";
import Game from "./components/Game";
import Auth from "./components/Login";
import "./index.css";
import api from "./lib/api";
import Error from "./components/Error";

export function App() {
    const [isTokenValid, setIsTokenValid] = useState<boolean>();
    const [error, setError] = useState<string>();
    const token = localStorage.getItem('token');

    async function checkEnv() {
        if (!window.crypto || !window.crypto.subtle || !window.crypto.subtle.digest)
            setError("Missing crypto module, may be you are not on a secured connection (HTTPS).");

        if (!token)
            return setIsTokenValid(false);

        try {
            await api.get('/me', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setIsTokenValid(true);
        } catch {
            setIsTokenValid(false);
        }
    }
    useEffect(() => void checkEnv(), []);

    return <>{
        error
            ? <Error error={error} />
            : isTokenValid == undefined
                ? <></>
                : !isTokenValid
                    ? <Auth />
                    : <Game />
    }</>;
}

export default App;
