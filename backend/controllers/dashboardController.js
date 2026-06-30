import pool from '../db.js';

export const getDashboard = async (req, res) => {
    const userId = req.user.id;

    try {
        const [foodResult] = await pool.query(`
            SELECT SUM(fe.quantity * fm.calories_per_unit) AS totalConsumed
            FROM food_entries fe
            JOIN food_master fm ON fe.food_id = fm.id
            WHERE fe.user_id = ?
        `, [userId]);

        const [exerciseResult] = await pool.query(`
            SELECT SUM(ee.duration * em.calories_burned) AS totalBurned
            FROM exercise_entries ee
            JOIN exercise_master em ON ee.exercise_id = em.id
            WHERE ee.user_id = ?
        `, [userId]);

        const consumed = foodResult[0].totalConsumed || 0;
        const burned = exerciseResult[0].totalBurned || 0;
        const netCalories = consumed - burned;

        res.json({
            consumed,
            burned,
            netCalories
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getReportDetails = async (req, res) => {
    const { date } = req.params;
    const userId = req.user.id;

    try {
        const foodQuery = `
            SELECT 
                fe.id,
                fm.food_name,
                fe.quantity,
                fm.calories_per_unit,
                (fe.quantity * fm.calories_per_unit) as total_calories,
                DATE_FORMAT(fe.created_at, '%H:%i') as time
            FROM food_entries fe
            JOIN food_master fm ON fe.food_id = fm.id
            WHERE DATE(fe.created_at) = ? AND fe.user_id = ?
            ORDER BY fe.created_at ASC
        `;

        const exerciseQuery = `
            SELECT 
                ee.id,
                em.exercise_name,
                ee.duration,
                em.calories_burned as calories_per_unit,
                (ee.duration * em.calories_burned) as total_burned,
                DATE_FORMAT(ee.created_at, '%H:%i') as time
            FROM exercise_entries ee
            JOIN exercise_master em ON ee.exercise_id = em.id
            WHERE DATE(ee.created_at) = ? AND ee.user_id = ?
            ORDER BY ee.created_at ASC
        `;

        const [foodResults] = await pool.query(foodQuery, [date, userId]);
        const [exerciseResults] = await pool.query(exerciseQuery, [date, userId]);

        res.json({
            foods: foodResults,
            exercises: exerciseResults
        });
    } catch (error) {
        console.error('Error fetching report details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
