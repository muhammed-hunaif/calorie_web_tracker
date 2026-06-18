import pool from '../db.js';

// create / save data in sql:
export const addFood = async (req, res) => {
    const { foodName, caloriesPerUnit, foodState } = req.body;

    if (!foodName || !caloriesPerUnit || !foodState) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const query = `
      INSERT INTO food_master (food_name, calories_per_unit, food_state)
      VALUES (?, ?, ?)
    `;
        const [result] = await pool.query(query, [foodName, caloriesPerUnit, foodState]);

        res.status(201).json({ message: 'Food added successfully', id: result.insertId });

    } catch (error) {
        console.error('Error adding food:', error);
        res.status(500).json({ message: error.message || 'Internal server error', error });
    }
};

// read:
export const getFoods = async (req, res) => {
    try {
        const query = 'SELECT * FROM food_master';
        const [foods] = await pool.query(query);
        res.status(200).json(foods);
    } catch (error) {
        console.error('Error fetching foods:', error);
        res.status(500).json({ message: error.message || 'Internal server error', error });
    }
};

// update:
export const updateFood = async (req, res) => {
    const { id } = req.params;
    const { foodName, caloriesPerUnit, foodState } = req.body;

    if (!foodName || !caloriesPerUnit || !foodState) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const query = `
        UPDATE food_master 
        SET food_name = ?, calories_per_unit = ?, food_state = ?
        WHERE id = ?
      `;
        const [result] = await pool.query(query, [foodName, caloriesPerUnit, foodState, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Food not found' });
        }

        res.status(200).json({ message: 'Food updated successfully' });
    } catch (error) {
        console.error('Error updating food:', error);
        res.status(500).json({ message: error.message || 'Internal server error', error });
    }
};

// delete:
export const deleteFood = async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM food_master WHERE id = ?';
        const [result] = await pool.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Food not found' });
        }

        res.status(200).json({ message: 'Food deleted successfully' });
    } catch (error) {
        console.error('Error deleting food:', error);
        res.status(500).json({ message: error.message || 'Internal server error', error });
    }
};