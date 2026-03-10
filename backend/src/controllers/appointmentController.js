const pool = require('../config/db');

// Get all appointments
const getAllAppointments = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM appointments');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get appointment by ID
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM appointments WHERE appointment_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new appointment
const createAppointment = async (req, res) => {
  try {
    const { patient_id, scheduled_with, appointment_type, scheduled_date, status, notes } = req.body;
    const result = await pool.query(
      'INSERT INTO appointments (patient_id, scheduled_with, appointment_type, scheduled_date, status, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [patient_id, scheduled_with, appointment_type, scheduled_date, status, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update appointment
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reminder_sent, notes } = req.body;
    const result = await pool.query(
      'UPDATE appointments SET status = $1, reminder_sent = $2, notes = $3 WHERE appointment_id = $4 RETURNING *',
      [status, reminder_sent, notes, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete appointment
const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM appointments WHERE appointment_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};