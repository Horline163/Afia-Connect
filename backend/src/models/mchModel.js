const pool = require('../config/db');

const getAllMCHRecords = async () => {
  const result = await pool.query('SELECT * FROM mch_records');
  return result.rows;
};

const getMCHRecordById = async (id) => {
  const result = await pool.query('SELECT * FROM mch_records WHERE mch_id = $1', [id]);
  return result.rows[0] || null;
};

const createMCHRecord = async (mchData) => {
  const { patient_id, record_type, gestational_age_weeks, visit_number, fundal_height, fetal_heart_rate, muac, high_risk_flag, risk_factors } = mchData;
  const result = await pool.query(
    'INSERT INTO mch_records (patient_id, record_type, gestational_age_weeks, visit_number, fundal_height, fetal_heart_rate, muac, high_risk_flag, risk_factors) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
    [patient_id, record_type, gestational_age_weeks, visit_number, fundal_height, fetal_heart_rate, muac, high_risk_flag, risk_factors]
  );
  return result.rows[0];
};

const updateMCHRecord = async (id, mchData) => {
  const { record_type, gestational_age_weeks, visit_number, fundal_height, fetal_heart_rate, muac, high_risk_flag, risk_factors } = mchData;
  const result = await pool.query(
    'UPDATE mch_records SET record_type = $1, gestational_age_weeks = $2, visit_number = $3, fundal_height = $4, fetal_heart_rate = $5, muac = $6, high_risk_flag = $7, risk_factors = $8 WHERE mch_id = $9 RETURNING *',
    [record_type, gestational_age_weeks, visit_number, fundal_height, fetal_heart_rate, muac, high_risk_flag, risk_factors, id]
  );
  return result.rows[0] || null;
};

const deleteMCHRecord = async (id) => {
  const result = await pool.query('DELETE FROM mch_records WHERE mch_id = $1 RETURNING *', [id]);
  return result.rows[0] || null;
};

module.exports = {
  getAllMCHRecords,
  getMCHRecordById,
  createMCHRecord,
  updateMCHRecord,
  deleteMCHRecord,
};