import ImageKit from 'imagekit';

// Credentials come from .env only. The private key must never be sent to the
// browser, which is why uploads are proxied through the backend instead of
// being performed by the React app.
const { IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT } = process.env;

export const isImageKitConfigured = Boolean(
    IMAGEKIT_PUBLIC_KEY && IMAGEKIT_PRIVATE_KEY && IMAGEKIT_URL_ENDPOINT
);

// Image upload is optional: the rest of the app works without ImageKit keys,
// and the upload endpoint reports 503 instead of crashing at startup.
export const imagekit = isImageKitConfigured
    ? new ImageKit({
        publicKey: IMAGEKIT_PUBLIC_KEY,
        privateKey: IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: IMAGEKIT_URL_ENDPOINT,
    })
    : null;

// Folder that every upload from this app lands in.
export const IMAGEKIT_FOLDER = process.env.IMAGEKIT_FOLDER || '/calorie-tracker';

// A stored image_url is only trusted if it points at our own ImageKit endpoint.
// This stops a caller from saving an arbitrary third-party or javascript: URL
// into the database, which would then be rendered by every client.
export const isAllowedImageUrl = (url) => {
    if (!IMAGEKIT_URL_ENDPOINT) return false;
    try {
        const parsed = new URL(url);
        const endpoint = new URL(IMAGEKIT_URL_ENDPOINT);
        return parsed.protocol === 'https:' && parsed.host === endpoint.host;
    } catch {
        return false;
    }
};
