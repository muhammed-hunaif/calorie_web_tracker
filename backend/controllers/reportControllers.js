import pool from '../db.js';
import { buildPage } from '../schema/commonSchema.js';

export const getReports = async (req, res) => {
    const userId = req.user.id;

    try {
        // Validated by validateQuery(reportQuerySchema); both dates are either
        // absent or a valid YYYY-MM-DD pair.
        const { fromDate, toDate, page, limit } = req.validatedQuery;
        const offset = (page - 1) * limit;

        // Pagination happens in SQL over the set of distinct days that have any
        // activity, so the server never loads every day into memory to slice
        // one page out of it.
        const range = fromDate && toDate;
        const foodFilter = range ? 'AND DATE(created_at) BETWEEN ? AND ?' : '';
        const exerciseFilter = range ? 'AND DATE(created_at) BETWEEN ? AND ?' : '';

        // Parameters for the two halves of the UNION, in order.
        const dateParams = range
            ? [userId, fromDate, toDate, userId, fromDate, toDate]
            : [userId, userId];

        const distinctDates = `
            SELECT DATE(created_at) AS date FROM food_entries
            WHERE user_id = ? ${foodFilter}
            UNION
            SELECT DATE(created_at) AS date FROM exercise_entries
            WHERE user_id = ? ${exerciseFilter}
        `;

        // Total number of days, for the pagination controls.
        const [[{ total }]] = await pool.query(
            `SELECT COUNT(*) AS total FROM (${distinctDates}) AS d`,
            dateParams
        );

        if (total === 0) {
            return res.json(buildPage([], 0, page, limit));
        }

        // The page of dates, newest first.
        const [dateRows] = await pool.query(
            `SELECT date FROM (${distinctDates}) AS d ORDER BY date DESC LIMIT ? OFFSET ?`,
            [...dateParams, limit, offset]
        );

        if (dateRows.length === 0) {
            return res.json(buildPage([], total, page, limit));
        }

        const pageDates = dateRows.map((row) =>
            row.date instanceof Date ? row.date.toLocaleDateString('en-CA') : String(row.date)
        );
        const placeholders = pageDates.map(() => '?').join(', ');

        // Aggregate only the days on this page.
        const [foodResults] = await pool.query(
            `
            SELECT DATE(fe.created_at) AS date,
                   SUM(fe.quantity * fm.calories_per_unit) AS totalConsumed
            FROM food_entries fe
            JOIN food_master fm ON fe.food_id = fm.id
            WHERE fe.user_id = ? AND DATE(fe.created_at) IN (${placeholders})
            GROUP BY DATE(fe.created_at)
            `,
            [userId, ...pageDates]
        );

        const [exerciseResults] = await pool.query(
            `
            SELECT DATE(ee.created_at) AS date,
                   SUM(ee.duration * em.calories_burned) AS totalBurned
            FROM exercise_entries ee
            JOIN exercise_master em ON ee.exercise_id = em.id
            WHERE ee.user_id = ? AND DATE(ee.created_at) IN (${placeholders})
            GROUP BY DATE(ee.created_at)
            `,
            [userId, ...pageDates]
        );

        const asKey = (value) =>
            value instanceof Date ? value.toLocaleDateString('en-CA') : String(value);

        const consumedByDate = new Map(
            foodResults.map((item) => [asKey(item.date), Number(item.totalConsumed) || 0])
        );
        const burnedByDate = new Map(
            exerciseResults.map((item) => [asKey(item.date), Number(item.totalBurned) || 0])
        );

        // Same row shape the frontend already renders: { date, consumed, burned, net }.
        const reports = pageDates.map((date) => {
            const consumed = consumedByDate.get(date) || 0;
            const burned = burnedByDate.get(date) || 0;
            return { date, consumed, burned, net: consumed - burned };
        });

        res.json(buildPage(reports, total, page, limit));
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
