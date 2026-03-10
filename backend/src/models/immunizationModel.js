const pool = require('../config/db');

const getAllImmunizations = async () => {
  const result = await pool.query('SELECT * FROM immunizations');
  return result.rows;
};

const getImmunizationById = async (id) => {
  const result = await pool.query('SELECT * FROM immunizations WHERE immunization_id = $1', [id]);
  return result.rows[0] || null;
};

const createImmunization = async (immunizationData) => {
  const { patient_id, vaccine_name, dose_number, next_due_date, administered_by, facility_id } = immunizationData;
  const result = await pool.query(
    'INSERT INTO immunizations (patient_id, vaccine_name, dose_number, next_due_date, administered_by, facility_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [patient_id, vaccine_name, dose_number, next_due_date, administered_by, facility_id]
  );
  return result.rows[0];
};

const updateImmunization = async (id, immunizationData) => {
  const { vaccine_name, dose_number, next_due_date } = immunizationData;
  const result = await pool.query(
    'UPDATE immunizations SET vaccine_name = $1, dose_number = $2, next_due_date = $3 WHERE immunization_id = $4 RETURNING *',
    [vaccine_name, dose_number, next_due_date, id]
  );
  return result.rows[0] || null;
};

const deleteImmunization = async (id) => {
  const result = await pool.query('DELETE FROM immunizations WHERE immunization_id = $1 RETURNING *', [id]);
  return result.rows[0] || null;
};

module.exports = {
  getAllImmunizations,
  getImmunizationById,
  createImmunization,
  updateImmunization,
  deleteImmunization,
};