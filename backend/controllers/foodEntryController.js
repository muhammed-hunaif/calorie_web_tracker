import pool from '../db.js';

// create
export const addFoodEntry = async (req, res) => {
    const { foodId, quantity } = req.body;

    if (!foodId || !quantity) {
        return res.status(400).json({ message: 'Food ID and quantity are required' });
    }

    try {
        const query = 'INSERT INTO food_entries (food_id, quantity) VALUES (?, ?)';
        const [result] = await pool.query(query, [foodId, quantity]);
        res.status(201).json({ message: 'Food entry saved successfully', id: result.insertId });
    } catch (error) {
        console.error('Error adding food entry:', error);
        res.status(500).json({ message: error.message || 'Internal server error', error });
    }
};

// read
export const getFoodEntries = async (req, res) => {
    try {
        const query = `
            SELECT fe.id, fe.food_id, fe.quantity, fe.created_at, fm.food_name, fm.calories_per_unit, fm.food_state
            FROM food_entries fe
            JOIN food_master fm ON fe.food_id = fm.id
            ORDER BY fe.created_at DESC
        `;
        const [entries] = await pool.query(query);
        res.status(200).json(entries);
    } catch (error) {
        console.error('Error fetching food entries:', error);
        res.status(500).json({ message: error.message || 'Internal server error', error });
    }
};

// update
export const updateFoodEntry = async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity) {
        return res.status(400).json({ message: 'Quantity is required' });
    }

    try {
        const query = 'UPDATE food_entries SET quantity = ? WHERE id = ?';
        const [result] = await pool.query(query, [quantity, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Food entry not found' });
        }

        res.status(200).json({ message: 'Food entry updated successfully' });
    } catch (error) {
        console.error('Error updating food entry:', error);
        res.status(500).json({ message: error.message || 'Internal server error', error });
    }
};

// delete
export const deleteFoodEntry = async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM food_entries WHERE id = ?';
        const [result] = await pool.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Food entry not found' });
        }

        res.status(200).json({ message: 'Food entry deleted successfully' });
    } catch (error) {
        console.error('Error deleting food entry:', error);
        res.status(500).json({ message: error.message || 'Internal server error', error });
    }
};
