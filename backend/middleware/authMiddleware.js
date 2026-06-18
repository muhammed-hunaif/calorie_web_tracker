import jwt from 'jsonwebtoken';
import pool from '../db.js';

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - No Token Provided' });
    }

    const decoded = jwt.verify(token,
        process.env.JWT_SECRET || 'secretkey');

    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized - Invalid Token' });
    }

    const [users] = await pool.execute('SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?', [decoded.userId]);
    const user = users[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error in protect middleware', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
