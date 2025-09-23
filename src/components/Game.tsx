import type { AxiosResponse } from 'axios';
import { useEffect, useRef, useState } from 'react';
import Error from './Error';
import api from '@/lib/api';
import SnakeIcon from '@/icons/Snake.svg';
import SnakeHuhIcon from '@/icons/SnakeHuh.svg';
import SpotifyHuh from '@/icons/SpotifyHuh.svg';
import Saved from '@/icons/Saved.jpeg';
import { Snake } from '@/components/ui/icon';
import { Checkbox } from './ui/checkbox';
import { ArrowBigDown, ArrowBigLeft, ArrowBigRight, ArrowBigUp } from 'lucide-react';

type PlaylistId = `playlist:${string}` | "saved";
interface Playlist {
    id: PlaylistId,
    name: string,
    image: string,
}
type TracklistId = PlaylistId | `album:${string}`;

export default function () {
    const token = localStorage.getItem("token");
    const [error, setError] = useState<string>();
    const [src, setSrc] = useState<string>(SnakeIcon);
    const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [selectedTracklist, setSelectedTracklist] = useState<TracklistId>();
    const [typingAlbum, setTypingAlbum] = useState<string>("");
    const [usePlayer, setUsePlayer] = useState<boolean>(false);

    async function fetchPlaylists() {
        if (!token) return setError('No token, please reload this page!');

        try {
            const response = await api.get('/me/playlists', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const rawPlaylists = response.data.items;
            const playlists: Playlist[] = [{
                id: "saved",
                name: "Liked songs",
                image: Saved
            }];
            for (const item of rawPlaylists)
                playlists.push({
                    id: `playlist:${item.id}`,
                    name: item.name,
                    image: item.images.length ? item.images[0].url : SpotifyHuh
                });
            setPlaylists(playlists);
        } catch {
            setError('An error occured while fetching your playlist :(');
        }
    }
    useEffect(() => void fetchPlaylists(), []);

    async function checkAlbum(url: string) {
        let id: string = url;
        if (url.startsWith("https://open.spotify.com/")) {
            if (!url.startsWith("https://open.spotify.com/album"))
                setError("Not an album D:");
            const match = /^https:\/\/open.spotify.com\/album\/([a-zA-Z0-9]+)/.exec(url);
            if (!match)
                return setError("Invalid album URL. Please reload this page to continue");
            id = match[1]!;
        }

        try {
            await api.get(`/albums/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setSelectedTracklist(`album:${id}`);
        } catch (err) {
            console.error(err);
            setError("Invalid album. Please reload this page to continue");
        }
    }

    async function checkPremium() {
        try {
            const response = await api.get("/me", { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.product != "premium")
                return setError("This account is not a Spotify Premium account");
            setUsePlayer(true);
        } catch (err) {
            console.error(err);
            setError("An error occurred while checking your premium status");
        }
    }

    document.addEventListener('keydown', (event) => {
        if (event.key == "Escape") setShowHowToPlay(false);
    });

    return <div className="w-screen h-screen flex flex-col">
        {showHowToPlay && <div
            className='absolute flex w-full h-full z-10 backdrop-blur-md'
        >
            <div className='w-1/2 h-4/5 bg-white border-2 m-auto rounded-3xl p-8 text-xl'>
                <p className='font-bold text-2xl'>How to play</p>
                <p>Use W/A/S/D or arrow key to navigate your snake.</p>
                <p>Eat the track on the screen will play it.</p>
                <p className='font-bold text-2xl mt-5'>Limitation</p>
                <p>To play this game with sound, you have to have a Spotify Premium accounts TvT.</p>
                <p>You are limited to a 35x35 board, which means the highest score that you can achieve is 1225 points.</p>
                <p>The liked song is limited to 800 track.</p>
                <p>There is some random line cut through the snake, I don't know where it's from or how to fix it ;-;</p>
            </div>
        </div>}
        {error
            ? <Error error={error} />
            : !selectedTracklist
                ? <div className="flex flex-col h-full xl:flex-row xl:m-auto xl:w-3/4 xl:h-3/4 xl:border-4 xl:border-black rounded-2xl">
                    <div className="h-1/3 w-full xl:h-full xl:w-1/2 flex flex-col">
                        <div className='py-5 m-auto flex flex-col items-center'>
                            <img
                                className='size-30 cursor-pointer'
                                src={src}
                                onMouseOver={() => setSrc(SnakeHuhIcon)}
                                onMouseLeave={() => setSrc(SnakeIcon)}
                                onClick={() => setShowHowToPlay(true)}
                            />
                            <p className='text-3xl font-bold'>Simple Snake Game</p>
                            <p className='text-xl'>Let the snake eat your playlist &gt;:)</p>
                        </div>
                        <div
                            className='flex flex-row xl:py-4 xl:px-7 px-5 gap-3 text-lg xl:text-xl items-center'
                            onClick={() => usePlayer ? setUsePlayer(false) : checkPremium()}
                        >
                            <Checkbox
                                className='size-6'
                                checked={usePlayer}
                            />
                            <p>Play the track when the snake eat it.<br /><span className='text-red-500'>* require Spotify Premium account</span></p>
                        </div>
                    </div>
                    <div className='h-1/3 w-full xl:h-full xl:w-1/2 flex flex-col p-5 gap-5'>{
                        !playlists.length
                            ? <div className='m-auto flex flex-col items-center gap-5'>
                                <Snake className='size-30 animate-spin' />
                                <p className='text-2xl'>Loading your playlists...</p>
                            </div>
                            : <>
                                <input
                                    className='w-full p-3 bg-gray-200 border-2 border-gray-300 rounded-xl'
                                    placeholder='Put album URL in here'
                                    value={typingAlbum}
                                    onChange={(event) => setTypingAlbum(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key != "Enter") return;
                                        checkAlbum(typingAlbum);
                                    }}
                                />
                                <p className='text-xl font-semibold'>Select one playlist to continue:</p>
                                <div className={'w-full h-4/5 flex flex-col gap-2 ' + (playlists.length >= 7 ? "xl:overflow-y-scroll" : "")}>{
                                    playlists.map((item) =>
                                        <button
                                            className='w-full h-1/3 xl:h-1/7 p-2 gap-3 overflow-x-clip flex flex-row items-center rounded-2xl border-2 border-gray-200 bg-gray-200 hover:bg-gray-400 cursor-pointer'
                                            onClick={() => setSelectedTracklist(item.id)}
                                        >
                                            <img src={item.image} className='h-[99%] rounded-xl' />
                                            <p className='text-2xl'>{item.name}</p>
                                        </button>
                                    )
                                }</div>
                            </>
                    }</div>
                </div>
                : <Game selectedTrackListId={selectedTracklist} token={token!} usePlayer={usePlayer} />
        }
    </div>;
}

interface Track {
    id: string,
    name: string,
    /** In second */
    length: number,
    image: string,
    artists: string[]
}

type Position = [x: number, y: number]
type Direction = "up" | "down" | "left" | "right";
const EliminatingDirection: Direction[][] = [["up", "down"], ["left", "right"]];

function Game({
    selectedTrackListId,
    token,
    usePlayer
}: {
    selectedTrackListId: TracklistId,
    token: string,
    usePlayer: boolean
}) {
    const [error, setError] = useState<string>();
    const [tracks, setTracks] = useState<Track[]>([]);
    const [highestScore, setHighestScore] = useState<number>(parseInt(localStorage.getItem("highest") || "0") || 0);

    // Player - to play the song
    const [player, setPlayer] = useState<any>(undefined);

    // Game board
    const blockOnGameBoard = 20;
    const [gameBoardSize, setGameBoardSize] = useState<number>(700);
    const [snakeSize, setSnakeSize] = useState<number>(50);

    // Game state
    const [paused, setPaused] = useState<boolean>(false);
    const [snake, setSnake] = useState<Position[]>([[0, 0], [0, 0], [0, 0]]);
    const [trackPosition, setTrackPosition] = useState<Position>([0, 0]);
    const [currentTrack, setCurrentTrack] = useState<Track>();
    const [playingTrack, setPlayingTrack] = useState<Track>();
    const [score, setScore] = useState<number>(0);
    const [gameOver, setGameOver] = useState<boolean | "out_of_song">(false);
    const [gameSpeed, setGameSpeed] = useState<0.5 | 1 | 2 | 3>(1);
    const direction = useRef<Direction>("down");
    const newDirection = useRef<Direction>("down");
    const gameLoop = useRef<NodeJS.Timeout>(null);

    useEffect(() => void initGame(), []);
    useEffect(() => setSnakeSize(gameBoardSize / blockOnGameBoard), [gameBoardSize]);
    useEffect(() => {
        if (!tracks.length) return;
        gameLoop.current = setInterval(() => gameTick(), 400 / gameSpeed);
        return () => clearInterval(gameLoop.current || undefined);
    }, [paused, direction, trackPosition, tracks, player, gameOver, score, gameSpeed]);
    useEffect(() => {
        if (!gameOver) return;
        const newHighestScore = Math.max(score, highestScore);
        localStorage.setItem("highest", newHighestScore.toString());
        setHighestScore(newHighestScore);
        player?.pause();
    }, [gameOver, player]);

    async function initGame() {
        setScore(0);
        setPaused(false);
        setGameOver(false);
        const newTracks = await getTracks();
        if (!newTracks) return;
        setTracks(newTracks);
        newApplePosition(newTracks);
    }

    async function getTracks() {
        try {
            const tracks: Track[] = [];
            if (selectedTrackListId == "saved") {
                let response: AxiosResponse = await api.get(
                    `/me/tracks?limit=50`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                for (const item of response.data.items)
                    tracks.push(extractTrack(item.track));
                while (response.data.next && tracks.length < 1225) {
                    response = await api.get(
                        response.data.next,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );

                    for (let index = 0; index < response.data.items.length && tracks.length < 1225; index++)
                        tracks.push(extractTrack(response.data.items[index].track));
                }
            } else if (selectedTrackListId.startsWith("playlist:")) {
                const response = await api.get(
                    `/playlists/${selectedTrackListId.slice(9)}?` +
                    `fields=tracks(items(track(album(images),artists(name),duration_ms,name,id)))`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                for (const item of response.data.tracks.items)
                    tracks.push(extractTrack(item.track));
            } else if (selectedTrackListId.startsWith("album:")) {
                const response = await api.get(
                    `/albums/${selectedTrackListId.slice(6)}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                for (const item of response.data.tracks.items)
                    tracks.push({
                        id: item.id,
                        name: item.name,
                        length: item.duration_ms,
                        image: response.data.images[0].url || SpotifyHuh,
                        artists: item.artists.map((val: { name: string }) => val.name)
                    });
            } else return setError("Hmmmm, I think the dev is fucked up...");
            return tracks;
        } catch (err) {
            setError("An error occured while fetching tracks.");
            console.error(err);
        }
    }
    const extractTrack = (track: any) => ({
        id: track.id,
        name: track.name,
        length: track.duration_ms,
        image: track.album?.images.length ? track.album.images[0].url : SpotifyHuh,
        artists: track.artists.map((val: { name: string }) => val.name)
    });

    document.addEventListener("keydown", async (event) => {
        switch (event.key) {
            case "Escape":
                if (gameOver) return;
                if (paused)
                    await player?.resume();
                else
                    await player?.pause();
                setPaused(!paused);
                break;
            case "ArrowUp":
            case "w":
                newDirection.current = "up";
                break;
            case "ArrowDown":
            case "s":
                newDirection.current = "down";
                break;
            case "ArrowLeft":
            case "a":
                newDirection.current = "left";
                break;
            case "ArrowRight":
            case "d":
                newDirection.current = "right";
                break;
        }
    });

    function changeDirection(newDirection: Direction) {
        const isEliminating = EliminatingDirection.find((pair) => pair.includes(direction.current))!.includes(newDirection);
        if (isEliminating == false) {
            direction.current = newDirection;
        }
    };

    async function gameTick() {
        if (paused) return;
        if (gameOver) return clearInterval(gameLoop.current || undefined);
        changeDirection(newDirection.current);
        moveSnake();
        if (doesSnakeEatSnake())
            return setGameOver(true);
        if (doesSnakeEatApple())
            await snakeEatApple();
    }

    function moveSnake() {
        const newSnake = [...snake];
        let previousPartX = newSnake[0]![0];
        let previousPartY = newSnake[0]![1];
        let tmpPartX = 0;
        let tmpPartY = 0;
        moveHead(newSnake);
        for (let i = 1; i < newSnake.length; i++) {
            tmpPartX = newSnake[i]![0];
            tmpPartY = newSnake[i]![1];
            newSnake[i]![0] = previousPartX;
            newSnake[i]![1] = previousPartY;
            previousPartX = tmpPartX;
            previousPartY = tmpPartY;
        }
        setSnake(newSnake);
    };
    function moveHead(newSnake: Position[]) {
        switch (direction.current) {
            case "up":
                newSnake[0]![1] = newSnake[0]![1] > 0 ? newSnake[0]![1] - 1 : blockOnGameBoard - 1;
                break;

            case "down":
                newSnake[0]![1] = newSnake[0]![1] < blockOnGameBoard - 1 ? newSnake[0]![1] + 1 : 0;
                break;

            case "left":
                newSnake[0]![0] = newSnake[0]![0] > 0 ? newSnake[0]![0] - 1 : blockOnGameBoard - 1;
                break;

            case "right":
                newSnake[0]![0] = newSnake[0]![0] < blockOnGameBoard - 1 ? newSnake[0]![0] + 1 : 0;
                break;
        }
    };

    function doesSnakeEatSnake() {
        for (let i = 1; i < snake.length; i++)
            if (snake[0]![0] == snake[i]![0] && snake[0]![1] == snake[i]![1])
                return true;
        return false;
    }

    function doesSnakeEatApple() {
        return snake[0]![0] == trackPosition[0] && snake[0]![1] == trackPosition[1];
    }

    function appleOnSnake(trackPosition: Position) {
        for (const part of snake)
            if (trackPosition[0] == part[0] && trackPosition[1] == part[1])
                return true;
        return false;
    }

    async function snakeEatApple() {
        const newSnake = [...snake];
        newSnake.push([-1, -1]);
        setSnake(newSnake);
        setScore((score) => score + 1);
        newApplePosition();
        if (!usePlayer) return;
        try {
            await api.put(
                `/me/player/play`,
                {
                    uris: [`spotify:track:${currentTrack!.id}`],
                    position_ms: Math.floor(Math.random() * currentTrack!.length * 2 / 3)
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
        } catch (error) {
            console.error(error);
        }
    }

    /* eslint-disable @typescript-eslint/naming-convention */
    function newApplePosition(_tracks: Track[] = tracks) {
        const newPosition: Position = [...trackPosition];
        while (appleOnSnake(newPosition)) {
            newPosition[0] = Math.floor(Math.random() * blockOnGameBoard);
            newPosition[1] = Math.floor(Math.random() * blockOnGameBoard);
        }
        setTrackPosition(newPosition);
        const newTracks = [..._tracks];
        const index = Math.floor(Math.random() * newTracks.length);
        const _currentTrack = newTracks.splice(index, 1).shift()!;
        if (!newTracks.length) return setGameOver('out_of_song');
        if (!usePlayer) setPlayingTrack(currentTrack);
        setCurrentTrack(_currentTrack);
        setTracks(newTracks);
    }
    /* eslint-enable @typescript-eslint/naming-convention */

    /* eslint-disable @typescript-eslint/naming-convention */
    useEffect(() => {
        if (player || error || !usePlayer) return;

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        (window as any).onSpotifyWebPlaybackSDKReady = () => {
            const player = new (window as any).Spotify.Player({
                name: 'Simple Spotify Snake',
                getOAuthToken: (cb: any) => { cb(token); },
                volume: 0.5
            });

            setPlayer(player);

            player.addListener('ready', async ({ device_id }: { device_id: string }) => {
                console.log('Ready with Device ID', device_id);
                try {
                    await api.put(
                        '/me/player',
                        { device_ids: [device_id], play: false },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );
                } catch (err) {
                    console.error(err);
                }
            });

            player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
                console.log('Device ID has gone offline', device_id);
            });
            player.addListener('player_state_changed', async ({ track_window }: any) => {
                if (!track_window) return;
                const { current_track } = track_window;
                try {
                    const response = await api.get(`/tracks/${current_track.id}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setPlayingTrack(extractTrack(response.data));
                } catch (error) {
                    console.error(error);
                }
            });

            player.connect();
        };

        return player?.disconnect();
    }, [player]);
    /* eslint-enable @typescript-eslint/naming-convention */

    return <>{
        error
            ? <Error error={error} />
            : !tracks.length
                ? <div className='m-auto flex flex-col items-center gap-10'>
                    <Snake className='size-30 animate-spin' />
                    <p className='text-2xl'>Loading your track...</p>
                </div>
                : <div
                    className='h-full w-full flex'
                    ref={(node) => {
                        if (!node) return;
                        setGameBoardSize(Math.floor(
                            Math.min(node.clientHeight, node.clientWidth) *
                            (node.clientWidth < 500 ? 9 / 10 : 4 / 5)
                        ));
                    }}
                >
                    <div className='m-auto flex xl:flex-row flex-col gap-5 p-5'>
                        <div className='w-full xl:hidden flex flex-col gap-2'>
                            <div className='w-full max-w-full flex flex-col gap-1'>
                                <p>{usePlayer ? "Now playing" : "On the screen"}</p>
                                <div className='w-full h-fit rounded-md border-1 p-4'>
                                    <p className='font-semibold'>{playingTrack?.name || "None..."}</p>
                                    <p>{
                                        playingTrack
                                            ? playingTrack.artists.join(", ").slice(0, 65) +
                                            (playingTrack.artists.join(", ").length >= 65 ? "..." : "")
                                            : ""
                                    }</p>
                                </div>
                            </div>
                            <div className='flex flex-row gap-10'>
                                <p><span className='font-bold'>Score:</span> {score}</p>
                                <p><span className='font-bold'>Highest:</span> {Math.max(score, highestScore)}</p>
                            </div>
                        </div>
                        <div
                            className='relative flex w-full xl:m-0 mx-auto border-3 border-black'
                            style={{
                                width: gameBoardSize + 4,
                                height: gameBoardSize + 4,
                            }}
                        >
                            {paused && <div className='h-full w-full absolute flex backdrop-blur-sm z-30'>
                                <div className='m-auto size-fit flex flex-col items-center'>
                                    <p className='text-black text-2xl font-bold'>PAUSED</p>
                                    <p className='text-black text-xl'>Press ESC again to resume</p>
                                    <p className='text-red-600 text-xl'>Note: If you pause the game continuously, it will not run normally ;-;</p>
                                </div>
                            </div>}
                            {gameOver && <div className='h-full w-full absolute flex backdrop-blur-sm z-30'>
                                <div className='m-auto size-fit flex flex-col items-center'>
                                    <p className='text-black text-2xl font-bold'>GAME OVER</p>
                                    {gameOver == "out_of_song" && <p>We run of songs D:</p>}
                                    <p className='text-black text-xl'><span className='font-bold'>Score:</span> {score}</p>
                                </div>
                            </div>}
                            {playingTrack && <img
                                className='absolute w-full h-full z-0'
                                src={playingTrack.image}
                            />}
                            <div className='h-full w-full absolute backdrop-blur-sm z-10' />
                            {snake.map((part) =>
                                (part[0] >= 0 && part[1] >= 0) &&
                                (part[0] < blockOnGameBoard && part[1] < blockOnGameBoard) && <div
                                    className='absolute bg-gray-700 z-20'
                                    style={{
                                        height: snakeSize,
                                        width: snakeSize,
                                        left: part[0] * snakeSize,
                                        top: part[1] * snakeSize
                                    }}
                                />
                            )}
                            <img
                                className='absolute z-20'
                                style={{
                                    height: snakeSize,
                                    width: snakeSize,
                                    left: trackPosition[0] * snakeSize,
                                    top: trackPosition[1] * snakeSize
                                }}
                                src={currentTrack!.image}
                            />
                        </div>
                        <div className='hidden xl:flex flex-col gap-2'>
                            <p>{usePlayer ? "Now playing" : "On the screen"}</p>
                            <div className='w-100 h-fit rounded-md border-1 p-4'>
                                <p className='font-semibold'>{playingTrack?.name || "None..."}</p>
                                <p>{playingTrack?.artists.join(", ") || ""}</p>
                            </div>
                            <p><span className='font-bold'>Score:</span> {score}</p>
                            <p><span className='font-bold'>Highest score:</span> {Math.max(score, highestScore)}</p>
                            <div className='flex flex-row gap-2 items-center'>
                                <p className='font-bold'>Speed</p>
                                <div className='w-40 h-10 border-2 rounded-2xl flex flex-row items-center text-center'>
                                    <p
                                        className={'h-full w-1/4 leading-9 rounded-tl-2xl rounded-bl-2xl cursor-pointer' + (gameSpeed == 0.5 ? ' bg-gray-700 text-white' : '')}
                                        onClick={() => setGameSpeed(0.5)}
                                    >0.5</p>
                                    <p
                                        className={'h-full w-1/4 leading-9 cursor-pointer' + (gameSpeed == 1 ? ' bg-gray-700 text-white' : '')}
                                        onClick={() => setGameSpeed(1)}
                                    >1</p>
                                    <p
                                        className={'h-full w-1/4 leading-9 cursor-pointer' + (gameSpeed == 2 ? ' bg-gray-700 text-white' : '')}
                                        onClick={() => setGameSpeed(2)}
                                    >2</p>
                                    <p
                                        className={'h-full w-1/4 leading-9 rounded-tr-2xl rounded-br-2xl cursor-pointer' + (gameSpeed == 3 ? ' bg-gray-700 text-white' : '')}
                                        onClick={() => setGameSpeed(3)}
                                    >3</p>
                                </div>
                            </div>
                        </div>
                        <div className='xl:hidden flex flex-col w-full gap-2 items-center'>
                            <div className='w-1/4 h-20 rounded-2xl bg-gray-300 flex'>
                                <ArrowBigUp className='m-auto size-10'
                                    onClick={() => newDirection.current = "up"}
                                />
                            </div>
                            <div className='w-4/5 h-20 flex flex-row gap-2'>
                                <div className='w-1/3 h-full rounded-2xl bg-gray-300 flex'>
                                    <ArrowBigLeft className='m-auto size-10'
                                        onClick={() => newDirection.current = "left"}
                                    />
                                </div>
                                <div className='w-1/3 h-full rounded-2xl bg-gray-300 flex'>
                                    <ArrowBigDown className='m-auto size-10'
                                        onClick={() => newDirection.current = "down"}
                                    />
                                </div>
                                <div className='w-1/3 h-full rounded-2xl bg-gray-300 flex'>
                                    <ArrowBigRight className='m-auto size-10'
                                        onClick={() => newDirection.current = "right"}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
    }</>;
}