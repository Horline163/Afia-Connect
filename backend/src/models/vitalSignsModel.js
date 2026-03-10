const pool = require('../config/db');

const getAllVitalSigns = async () => {
  const result = await pool.query('SELECT * FROM vital_signs');
  return result.rows;
};

const getVitalSignsById = async (id) => {
  const result = await pool.query('SELECT * FROM vital_signs WHERE vital_id = $1', [id]);
  return result.rows[0] || null;
};

const createVitalSigns = async (vitalData) => {
  const { record_id, temperature, heart_rate, respiratory_rate, blood_pressure_systolic, blood_pressure_diastolic, oxygen_saturation, weight, height } = vitalData;
  const result = await pool.query(
    'INSERT INTO vital_signs (record_id, temperature, heart_rate, respiratory_rate, blood_pressure_systolic, blood_pressure_diastolic, oxygen_saturation, weight, height) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
    [record_id, temperature, heart_rate, respiratory_rate, blood_pressure_systolic, blood_pressure_diastolic, oxygen_saturation, weight, height]
  );
  return result.rows[0];
};

const updateVitalSigns = async (id, vitalData) => {
  const { temperature, heart_rate, respiratory_rate, blood_pressure_systolic, blood_pressure_diastolic, oxygen_saturation, weight, height } = vitalData;
  const result = await pool.query(
    'UPDATE vital_signs SET temperature = $1, heart_rate = $2, respiratory_rate = $3, blood_pressure_systolic = $4, blood_pressure_diastolic = $5, oxygen_saturation = $6, weight = $7, height = $8 WHERE vital_id = $9 RETURNING *',
    [temperature, heart_rate, respiratory_rate, blood_pressure_systolic, blood_pressure_diastolic, oxygen_saturation, weight, height, id]
  );
  return result.rows[0] || null;
};

const deleteVitalSigns = async (id) => {
  const result = await pool.query('DELETE FROM vital_signs WHERE vital_id = $1 RETURNING *', [id]);
  return result.rows[0] || null;
};

module.exports = {
  getAllVitalSigns,
  getVitalSignsById,
  createVitalSigns,
  updateVitalSigns,
  deleteVitalSigns,
};