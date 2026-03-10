const pool = require('../config/db');

// Get all notifications
const getAllNotifications = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM notifications');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get notification by ID
const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM notifications WHERE notification_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new notification
const createNotification = async (req, res) => {
  try {
    const { user_id, type, channel, title, message } = req.body;
    const result = await pool.query(
      'INSERT INTO notifications (user_id, type, channel, title, message) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, type, channel, title, message]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update notification
const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_read } = req.body;
    const result = await pool.query(
      'UPDATE notifications SET is_read = $1, sent_at = NOW() WHERE notification_id = $2 RETURNING *',
      [is_read, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM notifications WHERE notification_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
};