import axios from "axios";
import { load } from "cheerio";

async function getSpotifyLinks(url: string) {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = load(html);
        const scdnLinks = new Set();

        $('*').each((i, element) => {
            if (!("attribs" in element)) return;
            const attrs = element.attribs;
            Object.values(attrs).forEach(value => {
                if (value && value.includes('p.scdn.co')) {
                    scdnLinks.add(value);
                }
            });
        });

        return Array.from(scdnLinks);
    } catch (error: any) {
        throw new Error(`Failed to fetch preview URLs: ${error.message}`);
    }
}

getSpotifyLinks("http://127.0.0.1:7000/?url=https://open.spotify.com/track/6VXVYATpQXEIoZ97NnWCmn").then(console.log)