const pool = require('../config/db');

// Get all immunizations
const getAllImmunizations = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM immunizations');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get immunization by ID
const getImmunizationById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM immunizations WHERE immunization_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Immunization not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new immunization
const createImmunization = async (req, res) => {
  try {
    const { patient_id, vaccine_name, dose_number, next_due_date, administered_by, facility_id } = req.body;
    const result = await pool.query(
      'INSERT INTO immunizations (patient_id, vaccine_name, dose_number, next_due_date, administered_by, facility_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [patient_id, vaccine_name, dose_number, next_due_date, administered_by, facility_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update immunization
const updateImmunization = async (req, res) => {
  try {
    const { id } = req.params;
    const { vaccine_name, dose_number, next_due_date } = req.body;
    const result = await pool.query(
      'UPDATE immunizations SET vaccine_name = $1, dose_number = $2, next_due_date = $3 WHERE immunization_id = $4 RETURNING *',
      [vaccine_name, dose_number, next_due_date, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Immunization not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete immunization
const deleteImmunization = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM immunizations WHERE immunization_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Immunization not found' });
    }
    res.json({ message: 'Immunization deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllImmunizations,
  getImmunizationById,
  createImmunization,
  updateImmunization,
  deleteImmunization,
};