import jwt from 'jsonwebtoken';
import pool from '../db.js';

export const protect = async (req, res, next) => {
  const token = req.cookies?.jwt;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - No Token Provided' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    // jwt.verify throws for expired / malformed / wrong-signature tokens.
    // These are authentication failures (401), never server errors (500).
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized - Token Expired' });
    }
    return res.status(401).json({ error: 'Unauthorized - Invalid Token' });
  }

  if (!decoded?.userId) {
    return res.status(401).json({ error: 'Unauthorized - Invalid Token' });
  }

  try {
    const [users] = await pool.execute(
      'SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?',
      [decoded.userId]
    );
    const user = users[0];

    if (!user) {
      // Correctly signed token for an account that no longer exists.
      // Still an authentication failure, so 401 (not 404) so the client logs out.
      return res.status(401).json({ error: 'Unauthorized - Invalid Token' });
    }

    // The authenticated identity. Controllers must read req.user.id and never
    // trust any user id supplied in the body, params or query string.
    req.user = user;
    next();
  } catch (error) {
    console.error('Error in protect middleware:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
