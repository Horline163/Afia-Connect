const pool = require('../config/db');

// Get all consultations
const getAllConsultations = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM consultations');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get consultation by ID
const getConsultationById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM consultations WHERE consultation_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Consultation not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new consultation
const createConsultation = async (req, res) => {
  try {
    const { patient_id, initiated_by, doctor_id, status, scheduled_time, consultation_type, consultation_notes } = req.body;
    const result = await pool.query(
      'INSERT INTO consultations (patient_id, initiated_by, doctor_id, status, scheduled_time, consultation_type, consultation_notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [patient_id, initiated_by, doctor_id, status, scheduled_time, consultation_type, consultation_notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update consultation
const updateConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, start_time, end_time, consultation_notes, session_recording_url } = req.body;
    const result = await pool.query(
      'UPDATE consultations SET status = $1, start_time = $2, end_time = $3, consultation_notes = $4, session_recording_url = $5 WHERE consultation_id = $6 RETURNING *',
      [status, start_time, end_time, consultation_notes, session_recording_url, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Consultation not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete consultation
const deleteConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM consultations WHERE consultation_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Consultation not found' });
    }
    res.json({ message: 'Consultation deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllConsultations,
  getConsultationById,
  createConsultation,
  updateConsultation,
  deleteConsultation,
};