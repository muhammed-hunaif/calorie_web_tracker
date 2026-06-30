import pool from '../db.js';

// create / save data in sql:
export const addFood = async (req, res) => {
    const { foodName, caloriesPerUnit, foodState } = req.body;
    const userId = req.user.id;

    try {
        const [duplicateCheck] = await pool.query(
            'SELECT id FROM food_master WHERE user_id = ? AND LOWER(food_name) = LOWER(?)',
            [userId, foodName]
        );
        if (duplicateCheck.length > 0) {
            return res.status(400).json({ message: 'Food item with this name already exists' });
        }

        const query = `
      INSERT INTO food_master (user_id, food_name, calories_per_unit, food_state)
      VALUES (?, ?, ?, ?)
    `;
        const [result] = await pool.query(query, [userId, foodName, caloriesPerUnit, foodState]);

        res.status(201).json({ message: 'Food added successfully', id: result.insertId });

    } catch (error) {
        console.error('Error adding food:', error);
        res.status(500).json({ message: error.message || 'Internal server error', error });
    }
};

// read:
export const getFoods = async (req, res) => {
    const userId = req.user.id;
    try {
        const query = 'SELECT * FROM food_master WHERE user_id = ?';
        const [foods] = await pool.query(query, [userId]);
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
    const userId = req.user.id;

    try {
        const [duplicateCheck] = await pool.query(
            'SELECT id FROM food_master WHERE user_id = ? AND LOWER(food_name) = LOWER(?) AND id != ?',
            [userId, foodName, id]
        );
        if (duplicateCheck.length > 0) {
            return res.status(400).json({ message: 'Another food item with this name already exists' });
        }

        const query = `
        UPDATE food_master 
        SET food_name = ?, calories_per_unit = ?, food_state = ?
        WHERE id = ? AND user_id = ?
      `;
        const [result] = await pool.query(query, [foodName, caloriesPerUnit, foodState, id, userId]);

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
    const userId = req.user.id;

    try {
        const query = 'DELETE FROM food_master WHERE id = ? AND user_id = ?';
        const [result] = await pool.query(query, [id, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Food not found' });
        }

        res.status(200).json({ message: 'Food deleted successfully' });
    } catch (error) {
        console.error('Error deleting food:', error);
        res.status(500).json({ message: error.message || 'Internal server error', error });
    }
};