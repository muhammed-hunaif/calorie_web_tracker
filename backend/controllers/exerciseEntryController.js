import pool from '../db.js';

// create
export const addExerciseEntry = async (req, res) => {
    const { exerciseId, duration } = req.body;

    if (!exerciseId || !duration) {
        return res.status(400).json({ message: 'Exercise ID and duration are required' });
    }

    try {
        const query = 'INSERT INTO exercise_entries (exercise_id, duration) VALUES (?, ?)';
        const [result] = await pool.query(query, [exerciseId, duration]);
        res.status(201).json({ message: 'Exercise entry saved successfully', id: result.insertId });
    } catch (error) {
        console.error('Error adding exercise entry:', error);
        res.status(500).json({ message: error.message || 'Internal server error', error });
    }
};

// read
export const getExerciseEntries = async (req, res) => {
    try {
        const query = `
            SELECT ee.id, ee.exercise_id, ee.duration, ee.created_at, em.exercise_name, em.calories_burned, em.unit
            FROM exercise_entries ee
            JOIN exercise_master em ON ee.exercise_id = em.id
            ORDER BY ee.created_at DESC
        `;
        const [entries] = await pool.query(query);
        res.status(200).json(entries);
    } catch (error) {
        console.error('Error fetching exercise entries:', error);
        res.status(500).json({ message: error.message || 'Internal server error', error });
    }
};

// update
export const updateExerciseEntry = async (req, res) => {
    const { id } = req.params;
    const { duration } = req.body;

    if (!duration) {
        return res.status(400).json({ message: 'Duration is required' });
    }

    try {
        const query = 'UPDATE exercise_entries SET duration = ? WHERE id = ?';
        const [result] = await pool.query(query, [duration, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Exercise entry not found' });
        }

        res.status(200).json({ message: 'Exercise entry updated successfully' });
    } catch (error) {
        console.error('Error updating exercise entry:', error);
        res.status(500).json({ message: error.message || 'Internal server error', error });
    }
};

// delete
export const deleteExerciseEntry = async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM exercise_entries WHERE id = ?';
        const [result] = await pool.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Exercise entry not found' });
        }

        res.status(200).json({ message: 'Exercise entry deleted successfully' });
    } catch (error) {
        console.error('Error deleting exercise entry:', error);
        res.status(500).json({ message: error.message || 'Internal server error', error });
    }
};
