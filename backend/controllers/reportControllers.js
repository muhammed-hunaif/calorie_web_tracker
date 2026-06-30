import pool from '../db.js';

export const getReports = async (req, res) => {
    const userId = req.user.id;

    try {
        const { fromDate, toDate } = req.query;
        
        let foodQuery = `
            SELECT 
                DATE(fe.created_at) as date,
                SUM(fe.quantity * fm.calories_per_unit) as totalConsumed
            FROM food_entries fe
            JOIN food_master fm ON fe.food_id = fm.id
            WHERE fe.user_id = ?
        `;

        let exerciseQuery = `
            SELECT 
                DATE(ee.created_at) as date,
                SUM(ee.duration * em.calories_burned) as totalBurned
            FROM exercise_entries ee
            JOIN exercise_master em ON ee.exercise_id = em.id
            WHERE ee.user_id = ?
        `;

        const foodParams = [userId];
        const exerciseParams = [userId];

        if (fromDate && toDate) {
            foodQuery += ` AND DATE(fe.created_at) >= ? AND DATE(fe.created_at) <= ?`;
            exerciseQuery += ` AND DATE(ee.created_at) >= ? AND DATE(ee.created_at) <= ?`;
            foodParams.push(fromDate, toDate);
            exerciseParams.push(fromDate, toDate);
        }

        foodQuery += ` GROUP BY DATE(fe.created_at)`;
        exerciseQuery += ` GROUP BY DATE(ee.created_at)`;

        const [foodResults] = await pool.query(foodQuery, foodParams);
        const [exerciseResults] = await pool.query(exerciseQuery, exerciseParams);

        const reportMap = {};

        foodResults.forEach(item => {
            const dateStr = new Date(item.date).toLocaleDateString('en-CA'); // gets YYYY-MM-DD
            reportMap[dateStr] = {
                date: dateStr,
                consumed: item.totalConsumed || 0,
                burned: 0,
                net: item.totalConsumed || 0
            };
        });

        exerciseResults.forEach(item => {
            const dateStr = new Date(item.date).toLocaleDateString('en-CA');
            if (!reportMap[dateStr]) {
                reportMap[dateStr] = {
                    date: dateStr,
                    consumed: 0,
                    burned: 0,
                    net: 0
                };
            }
            reportMap[dateStr].burned = item.totalBurned || 0;
            reportMap[dateStr].net = reportMap[dateStr].consumed - reportMap[dateStr].burned;
        });

        // Convert map to array and sort by date descending
        const reports = Object.values(reportMap).sort((a, b) => 
            new Date(b.date) - new Date(a.date));

        res.json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
