import pool from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'secretkey', {
    expiresIn: '15d',
  });

  res.cookie('jwt', token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    httpOnly: true, // prevents XSS(cross-site scripting)protects the cookie
    sameSite: 'strict', // CSRF protection(Cross-Site Request Forgery)Other websites cannot send cookie
    secure: process.env.NODE_ENV === 'production',// Cookie only sent over HTTPS
  });
};

export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const [existingUsers] = await pool.execute('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    const newUserId = result.insertId;

    if (newUserId) {
      generateTokenAndSetCookie(newUserId, res);
      res.status(201).json({
        _id: newUserId,
        username: username,
        email: email,
      });
    } else {
      res.status(400).json({ error: 'Invalid user data' });
    }
  } catch (error) {
    console.log('Error in signup controller', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    const isPasswordCorrect = await bcrypt.compare(password, user?.password || '');

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    generateTokenAndSetCookie(user.id, res);

    res.status(200).json({
      _id: user.id,
      username: user.username,
      email: user.email,
    });
  } 
  catch (error) {
    console.log('Error in login controller', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie('jwt', '', { maxAge: 0 });
    res.status(200).json({ message: 'Logged out successfully' });
  } 
  catch (error) {
    console.log('Error in logout controller', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const verifyAuth = async (req, res) => {
  try {
    const [users] = await pool.execute('SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?', [req.user.id]);
    const user = users[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Mapping id to _id so frontend compatibility is maintained (if frontend expects _id)
    const userResponse = {
      ...user,
      _id: user.id
    };
    
    res.status(200).json(userResponse);
  } catch (error) {
    console.log('Error in verifyAuth controller', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
