import pool from '../db.js';
import { buildPage } from '../schema/commonSchema.js';
import { isAllowedImageUrl } from '../config/imagekit.js';

// A stored image must come from our own ImageKit endpoint. Anything else
// (another host, a javascript: URL) is rejected rather than saved and later
// rendered by every client. null means "no image".
const checkImageUrl = (imageUrl, res) => {
    if (imageUrl === null || imageUrl === undefined) return { ok: true, value: null };
    if (!isAllowedImageUrl(imageUrl)) {
        res.status(400).json({ message: 'Image URL must be an uploaded ImageKit URL' });
        return { ok: false };
    }
    return { ok: true, value: imageUrl };
};

// create / save data in sql:
export const addExercise = async (req, res) => {
    const { exerciseName, unit, caloriesBurned, imageUrl } = req.body;
    const userId = req.user.id;

    const image = checkImageUrl(imageUrl, res);
    if (!image.ok) return;

    try {
        const [duplicateCheck] = await pool.query(
            'SELECT id FROM exercise_master WHERE user_id = ? AND LOWER(exercise_name) = LOWER(?)',
            [userId, exerciseName]
        );
        if (duplicateCheck.length > 0) {
            return res.status(409).json({ message: 'Exercise with this name already exists' });
        }

        const query = `
      INSERT INTO exercise_master (user_id, exercise_name, unit, calories_burned, image_url)
      VALUES (?, ?, ?, ?, ?)
    `;
        const [result] = await pool.query(query, [userId, exerciseName, unit, caloriesBurned, image.value]);

        res.status(201).json({ message: 'Exercise added successfully', id: result.insertId });
    } catch (error) {
        // The (user_id, exercise_name) unique index is the race-safe backstop
        // for the duplicate check above.
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Exercise with this name already exists' });
        }
        console.error('Error adding exercise:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// read:
export const getExercises = async (req, res) => {
    const userId = req.user.id;
    const { page, limit, all } = req.validatedQuery;

    try {
        const [[{ total }]] = await pool.query(
            'SELECT COUNT(*) AS total FROM exercise_master WHERE user_id = ?',
            [userId]
        );

        // `all=true` is used by the Exercise Entry dropdown, which needs every
        // row rather than one page. Still scoped to the authenticated user.
        if (all) {
            const [exercises] = await pool.query(
                'SELECT * FROM exercise_master WHERE user_id = ? ORDER BY exercise_name ASC',
                [userId]
            );
            return res.status(200).json(buildPage(exercises, total, 1, total || 1));
        }

        const offset = (page - 1) * limit;
        const [exercises] = await pool.query(
            'SELECT * FROM exercise_master WHERE user_id = ? ORDER BY id DESC LIMIT ? OFFSET ?',
            [userId, limit, offset]
        );

        res.status(200).json(buildPage(exercises, total, page, limit));
    } catch (error) {
        console.error('Error fetching exercises:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// update:
export const updateExercise = async (req, res) => {
    const { id } = req.validatedParams;
    const { exerciseName, unit, caloriesBurned, imageUrl } = req.body;
    const userId = req.user.id;

    const image = checkImageUrl(imageUrl, res);
    if (!image.ok) return;

    try {
        const [duplicateCheck] = await pool.query(
            'SELECT id FROM exercise_master WHERE user_id = ? AND LOWER(exercise_name) = LOWER(?) AND id != ?',
            [userId, exerciseName, id]
        );
        if (duplicateCheck.length > 0) {
            return res.status(409).json({ message: 'Another exercise with this name already exists' });
        }

        const query = `
        UPDATE exercise_master
        SET exercise_name = ?, unit = ?, calories_burned = ?, image_url = ?
        WHERE id = ? AND user_id = ?
      `;
        const [result] = await pool.query(query, [exerciseName, unit, caloriesBurned, image.value, id, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Exercise not found' });
        }

        res.status(200).json({ message: 'Exercise updated successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Another exercise with this name already exists' });
        }
        console.error('Error updating exercise:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// delete:
export const deleteExercise = async (req, res) => {
    const { id } = req.validatedParams;
    const userId = req.user.id;

    try {
        const query = 'DELETE FROM exercise_master WHERE id = ? AND user_id = ?';
        const [result] = await pool.query(query, [id, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Exercise not found' });
        }

        res.status(200).json({ message: 'Exercise deleted successfully' });
    } catch (error) {
        console.error('Error deleting exercise:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
