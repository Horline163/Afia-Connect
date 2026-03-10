const pool = require('../config/db');

// Get all medical records
const getAllMedicalRecords = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM medical_records');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get medical record by ID
const getMedicalRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM medical_records WHERE record_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Medical record not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new medical record
const createMedicalRecord = async (req, res) => {
  try {
    const { patient_id, recorded_by, visit_type, symptoms, vitals, diagnosis_notes, icd_10_code, facility_id } = req.body;
    const result = await pool.query(
      'INSERT INTO medical_records (patient_id, recorded_by, visit_type, symptoms, vitals, diagnosis_notes, icd_10_code, facility_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [patient_id, recorded_by, visit_type, symptoms, vitals, diagnosis_notes, icd_10_code, facility_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update medical record
const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { visit_type, symptoms, vitals, diagnosis_notes, icd_10_code, facility_id } = req.body;
    const result = await pool.query(
      'UPDATE medical_records SET visit_type = $1, symptoms = $2, vitals = $3, diagnosis_notes = $4, icd_10_code = $5, facility_id = $6 WHERE record_id = $7 RETURNING *',
      [visit_type, symptoms, vitals, diagnosis_notes, icd_10_code, facility_id, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Medical record not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete medical record
const deleteMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM medical_records WHERE record_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Medical record not found' });
    }
    res.json({ message: 'Medical record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
};