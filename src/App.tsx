import { useEffect, useState } from "react";
import Game from "./components/Game";
import Auth from "./components/Login";
import "./index.css";
import api from "./lib/api";

export function App() {
    const [isTokenValid, setIsTokenValid] = useState<boolean>();
    const token = localStorage.getItem('token');

    async function checkToken() {
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
    useEffect(() => void checkToken(), []);

    return <>{isTokenValid == undefined ? <></> : !isTokenValid ? <Auth /> : <Game />}</>;
}

export default App;
