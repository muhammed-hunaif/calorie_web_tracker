import { imagekit, isImageKitConfigured, IMAGEKIT_FOLDER } from '../config/imagekit.js';

// POST /api/upload/image
// Receives a base64 data URL, forwards it to ImageKit with the server-side
// private key, and returns the hosted URL for the client to store alongside a
// food or exercise master record.
export const uploadImage = async (req, res) => {
    if (!isImageKitConfigured) {
        return res.status(503).json({
            message: 'Image uploads are not configured on this server',
        });
    }

    const { file, fileName } = req.body;
    const userId = req.user.id;

    try {
        const result = await imagekit.upload({
            file, // base64 data URL, validated by uploadImageSchema
            fileName,
            // Per-user folder keeps one user's uploads out of another's listing.
            folder: `${IMAGEKIT_FOLDER}/user_${userId}`,
            // ImageKit appends a unique suffix, so two users uploading
            // "rice.png" cannot overwrite each other.
            useUniqueFileName: true,
        });

        res.status(201).json({
            message: 'Image uploaded successfully',
            url: result.url,
            thumbnailUrl: result.thumbnailUrl || result.url,
            fileId: result.fileId,
        });
    } catch (error) {
        // ImageKit errors can echo request detail, so log server-side only.
        console.error('Error uploading image to ImageKit:', error?.message || error);
        res.status(502).json({ message: 'Image upload failed. Please try again.' });
    }
};
