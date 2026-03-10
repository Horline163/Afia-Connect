const pool = require('../config/db');

const getAllAppointments = async () => {
  const result = await pool.query('SELECT * FROM appointments');
  return result.rows;
};

const getAppointmentById = async (id) => {
  const result = await pool.query('SELECT * FROM appointments WHERE appointment_id = $1', [id]);
  return result.rows[0] || null;
};

const createAppointment = async (appointmentData) => {
  const { patient_id, scheduled_with, appointment_type, scheduled_date, status, notes } = appointmentData;
  const result = await pool.query(
    'INSERT INTO appointments (patient_id, scheduled_with, appointment_type, scheduled_date, status, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [patient_id, scheduled_with, appointment_type, scheduled_date, status, notes]
  );
  return result.rows[0];
};

const updateAppointment = async (id, appointmentData) => {
  const { status, reminder_sent, notes } = appointmentData;
  const result = await pool.query(
    'UPDATE appointments SET status = $1, reminder_sent = $2, notes = $3 WHERE appointment_id = $4 RETURNING *',
    [status, reminder_sent, notes, id]
  );
  return result.rows[0] || null;
};

const deleteAppointment = async (id) => {
  const result = await pool.query('DELETE FROM appointments WHERE appointment_id = $1 RETURNING *', [id]);
  return result.rows[0] || null;
};

module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};