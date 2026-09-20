import pool from '../db.js';
import { buildPage } from '../schema/commonSchema.js';

// create
export const addExerciseEntry = async (req, res) => {
    // Ownership comes from the JWT only - never from the request body.
    const { exerciseId, duration } = req.body;
    const userId = req.user.id;

    try {
        // The referenced exercise must belong to the same user.
        const [exerciseCheck] = await pool.query(
            'SELECT id FROM exercise_master WHERE id = ? AND user_id = ?',
            [exerciseId, userId]
        );
        if (exerciseCheck.length === 0) {
            return res.status(404).json({ message: 'Exercise item not found' });
        }

        const query = 'INSERT INTO exercise_entries (user_id, exercise_id, duration) VALUES (?, ?, ?)';
        const [result] = await pool.query(query, [userId, exerciseId, duration]);
        res.status(201).json({ message: 'Exercise entry saved successfully', id: result.insertId });
    } catch (error) {
        console.error('Error adding exercise entry:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// read
export const getExerciseEntries = async (req, res) => {
    const userId = req.user.id;
    const { page, limit } = req.validatedQuery;
    const offset = (page - 1) * limit;

    try {
        const [[{ total }]] = await pool.query(
            'SELECT COUNT(*) AS total FROM exercise_entries WHERE user_id = ?',
            [userId]
        );

        const query = `
            SELECT ee.id, ee.exercise_id, ee.duration, ee.created_at, em.exercise_name, em.calories_burned, em.unit, em.image_url
            FROM exercise_entries ee
            JOIN exercise_master em ON ee.exercise_id = em.id
            WHERE ee.user_id = ?
            ORDER BY ee.created_at DESC, ee.id DESC
            LIMIT ? OFFSET ?
        `;
        const [entries] = await pool.query(query, [userId, limit, offset]);
        res.status(200).json(buildPage(entries, total, page, limit));
    } catch (error) {
        console.error('Error fetching exercise entries:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// update
export const updateExerciseEntry = async (req, res) => {
    const { id } = req.validatedParams;
    const { duration } = req.body;
    const userId = req.user.id;

    try {
        const query = 'UPDATE exercise_entries SET duration = ? WHERE id = ? AND user_id = ?';
        const [result] = await pool.query(query, [duration, id, userId]);

        if (result.affectedRows === 0) {
            // Same 404 for "missing" and "not yours" so ownership is not leaked.
            return res.status(404).json({ message: 'Exercise entry not found' });
        }

        res.status(200).json({ message: 'Exercise entry updated successfully' });
    } catch (error) {
        console.error('Error updating exercise entry:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// delete
export const deleteExerciseEntry = async (req, res) => {
    const { id } = req.validatedParams;
    const userId = req.user.id;

    try {
        const query = 'DELETE FROM exercise_entries WHERE id = ? AND user_id = ?';
        const [result] = await pool.query(query, [id, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Exercise entry not found' });
        }

        res.status(200).json({ message: 'Exercise entry deleted successfully' });
    } catch (error) {
        console.error('Error deleting exercise entry:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
