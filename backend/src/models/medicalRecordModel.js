const pool = require('../config/db');

const getAllMedicalRecords = async () => {
  const result = await pool.query('SELECT * FROM medical_records');
  return result.rows;
};

const getMedicalRecordById = async (id) => {
  const result = await pool.query('SELECT * FROM medical_records WHERE record_id = $1', [id]);
  return result.rows[0] || null;
};

const createMedicalRecord = async (recordData) => {
  const { patient_id, recorded_by, visit_type, symptoms, vitals, diagnosis_notes, icd_10_code, facility_id } = recordData;
  const result = await pool.query(
    'INSERT INTO medical_records (patient_id, recorded_by, visit_type, symptoms, vitals, diagnosis_notes, icd_10_code, facility_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
    [patient_id, recorded_by, visit_type, symptoms, vitals, diagnosis_notes, icd_10_code, facility_id]
  );
  return result.rows[0];
};

const updateMedicalRecord = async (id, recordData) => {
  const { visit_type, symptoms, vitals, diagnosis_notes, icd_10_code, facility_id } = recordData;
  const result = await pool.query(
    'UPDATE medical_records SET visit_type = $1, symptoms = $2, vitals = $3, diagnosis_notes = $4, icd_10_code = $5, facility_id = $6 WHERE record_id = $7 RETURNING *',
    [visit_type, symptoms, vitals, diagnosis_notes, icd_10_code, facility_id, id]
  );
  return result.rows[0] || null;
};

const deleteMedicalRecord = async (id) => {
  const result = await pool.query('DELETE FROM medical_records WHERE record_id = $1 RETURNING *', [id]);
  return result.rows[0] || null;
};

module.exports = {
  getAllMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
};