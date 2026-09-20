import pool from '../db.js';
import { buildPage } from '../schema/commonSchema.js';
import { isAllowedImageUrl } from '../config/imagekit.js';

// A stored image must come from our own ImageKit endpoint. Anything else
// (another host, a javascript: URL) is rejected rather than saved and later
// rendered by every client. null means "no image".
const checkImageUrl = (imageUrl, res) => {
    if (imageUrl === null || imageUrl === undefined) return { ok: true, value: null };
    if (!isAllowedImageUrl(imageUrl)) {
        res.status(400).json({ message: 'Image URL must be an uploaded ImageKit URL' });
        return { ok: false };
    }
    return { ok: true, value: imageUrl };
};

// create / save data in sql:
export const addFood = async (req, res) => {
    const { foodName, caloriesPerUnit, foodState, imageUrl } = req.body;
    const userId = req.user.id;

    const image = checkImageUrl(imageUrl, res);
    if (!image.ok) return;

    try {
        const [duplicateCheck] = await pool.query(
            'SELECT id FROM food_master WHERE user_id = ? AND LOWER(food_name) = LOWER(?)',
            [userId, foodName]
        );
        if (duplicateCheck.length > 0) {
            return res.status(409).json({ message: 'Food item with this name already exists' });
        }

        const query = `
      INSERT INTO food_master (user_id, food_name, calories_per_unit, food_state, image_url)
      VALUES (?, ?, ?, ?, ?)
    `;
        const [result] = await pool.query(query, [userId, foodName, caloriesPerUnit, foodState, image.value]);

        res.status(201).json({ message: 'Food added successfully', id: result.insertId });

    } catch (error) {
        // The (user_id, food_name) unique index is the race-safe backstop for
        // the duplicate check above.
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Food item with this name already exists' });
        }
        console.error('Error adding food:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// read:
export const getFoods = async (req, res) => {
    const userId = req.user.id;
    const { page, limit, all } = req.validatedQuery;

    try {
        const [[{ total }]] = await pool.query(
            'SELECT COUNT(*) AS total FROM food_master WHERE user_id = ?',
            [userId]
        );

        // `all=true` is used by the Food Entry dropdown, which needs every row
        // rather than one page. Still scoped to the authenticated user.
        if (all) {
            const [foods] = await pool.query(
                'SELECT * FROM food_master WHERE user_id = ? ORDER BY food_name ASC',
                [userId]
            );
            return res.status(200).json(buildPage(foods, total, 1, total || 1));
        }

        const offset = (page - 1) * limit;
        const [foods] = await pool.query(
            'SELECT * FROM food_master WHERE user_id = ? ORDER BY id DESC LIMIT ? OFFSET ?',
            [userId, limit, offset]
        );

        res.status(200).json(buildPage(foods, total, page, limit));
    } catch (error) {
        console.error('Error fetching foods:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// update:
export const updateFood = async (req, res) => {
    const { id } = req.validatedParams;
    const { foodName, caloriesPerUnit, foodState, imageUrl } = req.body;
    const userId = req.user.id;

    const image = checkImageUrl(imageUrl, res);
    if (!image.ok) return;

    try {
        const [duplicateCheck] = await pool.query(
            'SELECT id FROM food_master WHERE user_id = ? AND LOWER(food_name) = LOWER(?) AND id != ?',
            [userId, foodName, id]
        );
        if (duplicateCheck.length > 0) {
            return res.status(409).json({ message: 'Another food item with this name already exists' });
        }

        const query = `
        UPDATE food_master
        SET food_name = ?, calories_per_unit = ?, food_state = ?, image_url = ?
        WHERE id = ? AND user_id = ?
      `;
        const [result] = await pool.query(query, [foodName, caloriesPerUnit, foodState, image.value, id, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Food not found' });
        }

        res.status(200).json({ message: 'Food updated successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Another food item with this name already exists' });
        }
        console.error('Error updating food:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// delete:
export const deleteFood = async (req, res) => {
    const { id } = req.validatedParams;
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
        res.status(500).json({ message: 'Internal server error' });
    }
};
