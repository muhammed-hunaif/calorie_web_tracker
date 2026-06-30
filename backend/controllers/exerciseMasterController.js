import pool from '../db.js';

// create / save data in sql:
export const addExercise = async (req, res) => {
    const { exerciseName, unit, caloriesBurned } = req.body;
    const userId = req.user.id;

    try {
        const [duplicateCheck] = await pool.query(
            'SELECT id FROM exercise_master WHERE user_id = ? AND LOWER(exercise_name) = LOWER(?)',
            [userId, exerciseName]
        );
        if (duplicateCheck.length > 0) {
            return res.status(400).json({ message: 'Exercise with this name already exists' });
        }

        const query = `
      INSERT INTO exercise_master (user_id, exercise_name, unit, calories_burned)
      VALUES (?, ?, ?, ?)
    `;
        const [result] = await pool.query(query, [userId, exerciseName, unit, caloriesBurned]);

        res.status(201).json({ message: 'Exercise added successfully', id: result.insertId });
    } catch (error) {
        console.error('Error adding exercise:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// read:
export const getExercises = async (req, res) => {
    const userId = req.user.id;
    try {
        const query = 'SELECT * FROM exercise_master WHERE user_id = ?';
        const [exercises] = await pool.query(query, [userId]);
        res.status(200).json(exercises);
    } catch (error) {
        console.error('Error fetching exercises:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// update:
export const updateExercise = async (req, res) => {
    const { id } = req.params;
    const { exerciseName, unit, caloriesBurned } = req.body;
    const userId = req.user.id;

    try {
        const [duplicateCheck] = await pool.query(
            'SELECT id FROM exercise_master WHERE user_id = ? AND LOWER(exercise_name) = LOWER(?) AND id != ?',
            [userId, exerciseName, id]
        );
        if (duplicateCheck.length > 0) {
            return res.status(400).json({ message: 'Another exercise with this name already exists' });
        }

        const query = `
        UPDATE exercise_master 
        SET exercise_name = ?, unit = ?, calories_burned = ?
        WHERE id = ? AND user_id = ?
      `;
        const [result] = await pool.query(query, [exerciseName, unit, caloriesBurned, id, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Exercise not found' });
        }

        res.status(200).json({ message: 'Exercise updated successfully' });
    } catch (error) {
        console.error('Error updating exercise:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// delete:
export const deleteExercise = async (req, res) => {
    const { id } = req.params;
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
