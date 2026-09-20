import { z } from 'zod';

// 5 MB of raw image. Base64 inflates by ~4/3, so the route mounts a matching
// larger JSON body limit.
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// The browser sends a data URL from FileReader.readAsDataURL():
//   data:image/png;base64,iVBORw0KGgo...
const DATA_URL = /^data:(image\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/]+={0,2})$/i;

export const uploadImageSchema = z.object({
    fileName: z
        .string('File name must be a string')
        .trim()
        .min(1, 'File name is required')
        .max(200, 'File name must not exceed 200 characters')
        // Strip any path so a caller cannot steer the upload out of the folder.
        .transform((name) => name.replace(/[^\w.\-]+/g, '_')),
    file: z
        .string('File must be a base64 data URL')
        .refine((value) => DATA_URL.test(value), {
            message: 'File must be a base64 data URL, e.g. data:image/png;base64,...',
        })
        .refine(
            (value) => {
                const type = value.match(DATA_URL)?.[1]?.toLowerCase();
                return Boolean(type) && ALLOWED_IMAGE_TYPES.includes(type);
            },
            { message: `Image must be one of: ${ALLOWED_IMAGE_TYPES.join(', ')}` }
        )
        .refine(
            (value) => {
                const base64 = value.match(DATA_URL)?.[2] ?? '';
                // Decoded byte length without materialising the buffer.
                const padding = (base64.match(/=*$/)?.[0] ?? '').length;
                return (base64.length * 3) / 4 - padding <= MAX_IMAGE_BYTES;
            },
            { message: `Image must not exceed ${MAX_IMAGE_BYTES / (1024 * 1024)} MB` }
        ),
});

// Optional image URL accepted by the food/exercise master create+update APIs.
// Empty string and null both mean "no image" / "remove the image".
export const optionalImageUrl = z
    .union([z.string().trim().max(500, 'Image URL must not exceed 500 characters'), z.null()])
    .optional()
    .transform((value) => (value === '' || value === undefined ? null : value));
