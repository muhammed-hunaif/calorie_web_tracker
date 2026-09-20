import dotenv from 'dotenv';

dotenv.config();

// Every secret and connection detail must come from the environment.
// There are deliberately NO fallback/default values here: a missing variable
// must crash the process at startup rather than silently run with a
// hardcoded credential or an undefined JWT secret (which would make
// jwt.verify throw on every request and surface as a 500).
const REQUIRED_ENV_VARS = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];

const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);

if (missing.length > 0) {
    console.error(
        `Missing required environment variable(s): ${missing.join(', ')}.\n` +
        'Copy backend/.env.example to backend/.env and fill in real values.'
    );
    process.exit(1);
}

// A short JWT secret is easier to brute-force, and anyone who recovers it can
// mint a token for any user id and defeat the whole ownership model.
// Warn loudly rather than exiting, so an existing deployment keeps running.
const MIN_JWT_SECRET_LENGTH = 32;

// ImageKit is optional - the app runs without it and the upload endpoint
// answers 503. But a half-filled set of keys is always a mistake, so say so.
const IMAGEKIT_ENV_VARS = ['IMAGEKIT_PUBLIC_KEY', 'IMAGEKIT_PRIVATE_KEY', 'IMAGEKIT_URL_ENDPOINT'];
const imagekitSet = IMAGEKIT_ENV_VARS.filter((name) => process.env[name]);

if (imagekitSet.length > 0 && imagekitSet.length < IMAGEKIT_ENV_VARS.length) {
    console.warn(
        'WARNING: ImageKit is partially configured. Missing: ' +
        IMAGEKIT_ENV_VARS.filter((name) => !process.env[name]).join(', ') +
        '. Image uploads will be disabled until all three are set.'
    );
} else if (imagekitSet.length === 0) {
    console.warn('ImageKit keys not set - image uploads are disabled (POST /api/upload/image returns 503).');
}

if (process.env.JWT_SECRET.length < MIN_JWT_SECRET_LENGTH) {
    console.warn(
        `WARNING: JWT_SECRET is ${process.env.JWT_SECRET.length} characters; ` +
        `${MIN_JWT_SECRET_LENGTH}+ is recommended. Generate a stronger one with:\n` +
        '  node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"\n' +
        'Rotating it logs every user out, which is expected.'
    );
}
