const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query('SELECT user_id, username, role, is_active FROM users WHERE user_id = $1', [decoded.userId]);

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return res.status(401).json({ message: 'Invalid or inactive user' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

module.exports = {
  authenticateToken,
};