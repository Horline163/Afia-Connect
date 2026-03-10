const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await pool.query('UPDATE users SET last_login = NOW() WHERE user_id = $1', [user.user_id]);
    res.json({ token, user: { user_id: user.user_id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Register (optional, or move to userController)
const register = async (req, res) => {
  try {
    const { username, password, email, phone_number, first_name, last_name, role, facility_id } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password_hash, email, phone_number, first_name, last_name, role, facility_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING user_id, username, role',
      [username, hashedPassword, email, phone_number, first_name, last_name, role, facility_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // unique violation
      res.status(400).json({ message: 'Username or email already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = {
  login,
  register,
};