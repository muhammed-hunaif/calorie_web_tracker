import pool from '../db.js';
import { buildPage } from '../schema/commonSchema.js';

// create
export const addFoodEntry = async (req, res) => {
    // req.body has been validated and stripped of unknown keys, so a client
    // supplied "user_id" never reaches this point. Ownership always comes from
    // the JWT-derived req.user.
    const { foodId, quantity } = req.body;
    const userId = req.user.id;

    try {
        // The referenced food must belong to the same user, otherwise a user
        // could attach their entry to somebody else's food_master row.
        const [foodCheck] = await pool.query(
            'SELECT id FROM food_master WHERE id = ? AND user_id = ?',
            [foodId, userId]
        );
        if (foodCheck.length === 0) {
            return res.status(404).json({ message: 'Food item not found' });
        }

        const query = 'INSERT INTO food_entries (user_id, food_id, quantity) VALUES (?, ?, ?)';
        const [result] = await pool.query(query, [userId, foodId, quantity]);
        res.status(201).json({ message: 'Food entry saved successfully', id: result.insertId });
    } catch (error) {
        console.error('Error adding food entry:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// read
export const getFoodEntries = async (req, res) => {
    const userId = req.user.id;
    const { page, limit } = req.validatedQuery;
    const offset = (page - 1) * limit;

    try {
        const [[{ total }]] = await pool.query(
            'SELECT COUNT(*) AS total FROM food_entries WHERE user_id = ?',
            [userId]
        );

        const query = `
            SELECT fe.id, fe.food_id, fe.quantity, fe.created_at, fm.food_name, fm.calories_per_unit, fm.food_state, fm.image_url
            FROM food_entries fe
            JOIN food_master fm ON fe.food_id = fm.id
            WHERE fe.user_id = ?
            ORDER BY fe.created_at DESC, fe.id DESC
            LIMIT ? OFFSET ?
        `;
        const [entries] = await pool.query(query, [userId, limit, offset]);
        res.status(200).json(buildPage(entries, total, page, limit));
    } catch (error) {
        console.error('Error fetching food entries:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// update
export const updateFoodEntry = async (req, res) => {
    const { id } = req.validatedParams;
    const { quantity } = req.body;
    const userId = req.user.id;

    try {
        // AND user_id = ? makes this a no-op on another user's row.
        const query = 'UPDATE food_entries SET quantity = ? WHERE id = ? AND user_id = ?';
        const [result] = await pool.query(query, [quantity, id, userId]);

        if (result.affectedRows === 0) {
            // Same 404 whether the row is missing or owned by somebody else,
            // so the response never reveals that another user's row exists.
            return res.status(404).json({ message: 'Food entry not found' });
        }

        res.status(200).json({ message: 'Food entry updated successfully' });
    } catch (error) {
        console.error('Error updating food entry:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// delete
export const deleteFoodEntry = async (req, res) => {
    const { id } = req.validatedParams;
    const userId = req.user.id;

    try {
        const query = 'DELETE FROM food_entries WHERE id = ? AND user_id = ?';
        const [result] = await pool.query(query, [id, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Food entry not found' });
        }

        res.status(200).json({ message: 'Food entry deleted successfully' });
    } catch (error) {
        console.error('Error deleting food entry:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
