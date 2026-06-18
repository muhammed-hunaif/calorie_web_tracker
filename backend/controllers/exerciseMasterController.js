import pool from '../db.js';

// create / save data in sql:
export const addExercise = async (req, res) => {
    const { exerciseName, unit, caloriesBurned } = req.body;

    if (!exerciseName || !unit || !caloriesBurned) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const query = `
      INSERT INTO exercise_master (exercise_name, unit, calories_burned)
      VALUES (?, ?, ?)
    `;
        const [result] = await pool.query(query, [exerciseName, unit, caloriesBurned]);

        res.status(201).json({ message: 'Exercise added successfully', id: result.insertId });
    } catch (error) {
        console.error('Error adding exercise:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// read:
export const getExercises = async (req, res) => {
    try {
        const query = 'SELECT * FROM exercise_master';
        const [exercises] = await pool.query(query);
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

    if (!exerciseName || !unit || !caloriesBurned) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const query = `
        UPDATE exercise_master 
        SET exercise_name = ?, unit = ?, calories_burned = ?
        WHERE id = ?
      `;
        const [result] = await pool.query(query, [exerciseName, unit, caloriesBurned, id]);

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

    try {
        const query = 'DELETE FROM exercise_master WHERE id = ?';
        const [result] = await pool.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Exercise not found' });
        }

        res.status(200).json({ message: 'Exercise deleted successfully' });
    } catch (error) {
        console.error('Error deleting exercise:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
