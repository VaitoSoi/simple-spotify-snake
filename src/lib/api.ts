import axios from "axios";

export const BaseURL = "https://api.spotify.com/v1";
export const ClientID = "7b75fe9ebf524e77b2ddc42554eb1f80";
export const RedirectURI = "http://127.0.0.1:8080/auth";
export const DefaultScope = "streaming playlist-read-private user-library-read user-read-playback-state user-modify-playback-state user-read-private";
export default axios.create({ baseURL: BaseURL });