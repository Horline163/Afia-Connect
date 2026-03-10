const pool = require('../config/db');

const getAllConsultations = async () => {
  const result = await pool.query('SELECT * FROM consultations');
  return result.rows;
};

const getConsultationById = async (id) => {
  const result = await pool.query('SELECT * FROM consultations WHERE consultation_id = $1', [id]);
  return result.rows[0] || null;
};

const createConsultation = async (consultationData) => {
  const { patient_id, initiated_by, doctor_id, status, scheduled_time, consultation_type, consultation_notes } = consultationData;
  const result = await pool.query(
    'INSERT INTO consultations (patient_id, initiated_by, doctor_id, status, scheduled_time, consultation_type, consultation_notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [patient_id, initiated_by, doctor_id, status, scheduled_time, consultation_type, consultation_notes]
  );
  return result.rows[0];
};

const updateConsultation = async (id, consultationData) => {
  const { status, start_time, end_time, consultation_notes, session_recording_url } = consultationData;
  const result = await pool.query(
    'UPDATE consultations SET status = $1, start_time = $2, end_time = $3, consultation_notes = $4, session_recording_url = $5 WHERE consultation_id = $6 RETURNING *',
    [status, start_time, end_time, consultation_notes, session_recording_url, id]
  );
  return result.rows[0] || null;
};

const deleteConsultation = async (id) => {
  const result = await pool.query('DELETE FROM consultations WHERE consultation_id = $1 RETURNING *', [id]);
  return result.rows[0] || null;
};

module.exports = {
  getAllConsultations,
  getConsultationById,
  createConsultation,
  updateConsultation,
  deleteConsultation,
};