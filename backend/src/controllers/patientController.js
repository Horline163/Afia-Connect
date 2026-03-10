const pool = require('../config/db');

// Get all patients
const getAllPatients = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM patients');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get patient by ID
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM patients WHERE patient_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new patient
const createPatient = async (req, res) => {
  try {
    const { national_id, first_name, last_name, date_of_birth, gender, phone_number, village, health_area, gps_home, emergency_contact, created_by } = req.body;
    const result = await pool.query(
      'INSERT INTO patients (national_id, first_name, last_name, date_of_birth, gender, phone_number, village, health_area, gps_home, emergency_contact, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [national_id, first_name, last_name, date_of_birth, gender, phone_number, village, health_area, gps_home, emergency_contact, created_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update patient
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { national_id, first_name, last_name, date_of_birth, gender, phone_number, village, health_area, gps_home, emergency_contact } = req.body;
    const result = await pool.query(
      'UPDATE patients SET national_id = $1, first_name = $2, last_name = $3, date_of_birth = $4, gender = $5, phone_number = $6, village = $7, health_area = $8, gps_home = $9, emergency_contact = $10 WHERE patient_id = $11 RETURNING *',
      [national_id, first_name, last_name, date_of_birth, gender, phone_number, village, health_area, gps_home, emergency_contact, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete patient
const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM patients WHERE patient_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
};