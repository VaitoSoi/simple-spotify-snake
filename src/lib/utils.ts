import axios from "axios";
import { load } from "cheerio";

export function generateRandomString(length: number): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = window.crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

export async function sha256(plain: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return await window.crypto.subtle.digest('SHA-256', data);
}

export const base64Encode = (input: ArrayBuffer) =>
    btoa(String.fromCharCode(...new Uint8Array(input)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

/**
 * @see https://github.com/lakshay007/spot/blob/7f34ebeda92e05a91da38eed432288c1dfba0b0d/index.js#L20-L40 
 */
export async function getSpotifyLinks(url: string) {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = load(html);
        const scdnLinks = new Set<string>();

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
    } catch (error) {
        if (error instanceof Error)
            throw new Error(`Failed to fetch preview URLs: ${error.message}`);
        throw error;
    }
}

// ShadCN

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
