const pool = require('../config/db');

const getAllUsers = async () => {
  const result = await pool.query('SELECT * FROM users');
  return result.rows;
};

const getUserById = async (id) => {
  const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [id]);
  return result.rows[0] || null;
};

const createUser = async (userData) => {
  const { username, password_hash, email, phone_number, first_name, last_name, role, facility_id } = userData;
  const result = await pool.query(
    'INSERT INTO users (username, password_hash, email, phone_number, first_name, last_name, role, facility_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
    [username, password_hash, email, phone_number, first_name, last_name, role, facility_id]
  );
  return result.rows[0];
};

const updateUser = async (id, userData) => {
  const { username, email, phone_number, first_name, last_name, role, facility_id, is_active } = userData;
  const result = await pool.query(
    'UPDATE users SET username = $1, email = $2, phone_number = $3, first_name = $4, last_name = $5, role = $6, facility_id = $7, is_active = $8 WHERE user_id = $9 RETURNING *',
    [username, email, phone_number, first_name, last_name, role, facility_id, is_active, id]
  );
  return result.rows[0] || null;
};

const deleteUser = async (id) => {
  const result = await pool.query('DELETE FROM users WHERE user_id = $1 RETURNING *', [id]);
  return result.rows[0] || null;
};

const getUserByUsername = async (username) => {
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0] || null;
};

const updateLastLogin = async (id) => {
  await pool.query('UPDATE users SET last_login = NOW() WHERE user_id = $1', [id]);
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserByUsername,
  updateLastLogin,
};