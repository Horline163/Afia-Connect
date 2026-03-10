const pool = require('../config/db');

const getAllPatients = async () => {
  const result = await pool.query('SELECT * FROM patients');
  return result.rows;
};

const getPatientById = async (id) => {
  const result = await pool.query('SELECT * FROM patients WHERE patient_id = $1', [id]);
  return result.rows[0] || null;
};

const createPatient = async (patientData) => {
  const { national_id, first_name, last_name, date_of_birth, gender, phone_number, village, health_area, gps_home, emergency_contact, created_by } = patientData;
  const result = await pool.query(
    'INSERT INTO patients (national_id, first_name, last_name, date_of_birth, gender, phone_number, village, health_area, gps_home, emergency_contact, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
    [national_id, first_name, last_name, date_of_birth, gender, phone_number, village, health_area, gps_home, emergency_contact, created_by]
  );
  return result.rows[0];
};

const updatePatient = async (id, patientData) => {
  const { national_id, first_name, last_name, date_of_birth, gender, phone_number, village, health_area, gps_home, emergency_contact } = patientData;
  const result = await pool.query(
    'UPDATE patients SET national_id = $1, first_name = $2, last_name = $3, date_of_birth = $4, gender = $5, phone_number = $6, village = $7, health_area = $8, gps_home = $9, emergency_contact = $10 WHERE patient_id = $11 RETURNING *',
    [national_id, first_name, last_name, date_of_birth, gender, phone_number, village, health_area, gps_home, emergency_contact, id]
  );
  return result.rows[0] || null;
};

const deletePatient = async (id) => {
  const result = await pool.query('DELETE FROM patients WHERE patient_id = $1 RETURNING *', [id]);
  return result.rows[0] || null;
};

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
};