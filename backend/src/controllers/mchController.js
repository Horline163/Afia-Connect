const pool = require('../config/db');

// Get all MCH records
const getAllMCHRecords = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mch_records');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get MCH record by ID
const getMCHRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM mch_records WHERE mch_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'MCH record not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new MCH record
const createMCHRecord = async (req, res) => {
  try {
    const { patient_id, record_type, gestational_age_weeks, visit_number, fundal_height, fetal_heart_rate, muac, high_risk_flag, risk_factors } = req.body;
    const result = await pool.query(
      'INSERT INTO mch_records (patient_id, record_type, gestational_age_weeks, visit_number, fundal_height, fetal_heart_rate, muac, high_risk_flag, risk_factors) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [patient_id, record_type, gestational_age_weeks, visit_number, fundal_height, fetal_heart_rate, muac, high_risk_flag, risk_factors]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update MCH record
const updateMCHRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { record_type, gestational_age_weeks, visit_number, fundal_height, fetal_heart_rate, muac, high_risk_flag, risk_factors } = req.body;
    const result = await pool.query(
      'UPDATE mch_records SET record_type = $1, gestational_age_weeks = $2, visit_number = $3, fundal_height = $4, fetal_heart_rate = $5, muac = $6, high_risk_flag = $7, risk_factors = $8 WHERE mch_id = $9 RETURNING *',
      [record_type, gestational_age_weeks, visit_number, fundal_height, fetal_heart_rate, muac, high_risk_flag, risk_factors, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'MCH record not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete MCH record
const deleteMCHRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM mch_records WHERE mch_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'MCH record not found' });
    }
    res.json({ message: 'MCH record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllMCHRecords,
  getMCHRecordById,
  createMCHRecord,
  updateMCHRecord,
  deleteMCHRecord,
};