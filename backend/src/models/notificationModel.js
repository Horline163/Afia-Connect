const pool = require('../config/db');

const getAllNotifications = async () => {
  const result = await pool.query('SELECT * FROM notifications');
  return result.rows;
};

const getNotificationById = async (id) => {
  const result = await pool.query('SELECT * FROM notifications WHERE notification_id = $1', [id]);
  return result.rows[0] || null;
};

const createNotification = async (notificationData) => {
  const { user_id, type, channel, title, message } = notificationData;
  const result = await pool.query(
    'INSERT INTO notifications (user_id, type, channel, title, message) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [user_id, type, channel, title, message]
  );
  return result.rows[0];
};

const updateNotification = async (id, notificationData) => {
  const { is_read } = notificationData;
  const result = await pool.query(
    'UPDATE notifications SET is_read = $1, sent_at = NOW() WHERE notification_id = $2 RETURNING *',
    [is_read, id]
  );
  return result.rows[0] || null;
};

const deleteNotification = async (id) => {
  const result = await pool.query('DELETE FROM notifications WHERE notification_id = $1 RETURNING *', [id]);
  return result.rows[0] || null;
};

module.exports = {
  getAllNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
};