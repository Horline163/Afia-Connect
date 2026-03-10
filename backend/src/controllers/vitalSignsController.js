const pool = require('../config/db');

// Get all vital signs
const getAllVitalSigns = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vital_signs');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get vital signs by ID
const getVitalSignsById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM vital_signs WHERE vital_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Vital signs not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new vital signs
const createVitalSigns = async (req, res) => {
  try {
    const { record_id, temperature, heart_rate, respiratory_rate, blood_pressure_systolic, blood_pressure_diastolic, oxygen_saturation, weight, height } = req.body;
    const result = await pool.query(
      'INSERT INTO vital_signs (record_id, temperature, heart_rate, respiratory_rate, blood_pressure_systolic, blood_pressure_diastolic, oxygen_saturation, weight, height) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [record_id, temperature, heart_rate, respiratory_rate, blood_pressure_systolic, blood_pressure_diastolic, oxygen_saturation, weight, height]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update vital signs
const updateVitalSigns = async (req, res) => {
  try {
    const { id } = req.params;
    const { temperature, heart_rate, respiratory_rate, blood_pressure_systolic, blood_pressure_diastolic, oxygen_saturation, weight, height } = req.body;
    const result = await pool.query(
      'UPDATE vital_signs SET temperature = $1, heart_rate = $2, respiratory_rate = $3, blood_pressure_systolic = $4, blood_pressure_diastolic = $5, oxygen_saturation = $6, weight = $7, height = $8 WHERE vital_id = $9 RETURNING *',
      [temperature, heart_rate, respiratory_rate, blood_pressure_systolic, blood_pressure_diastolic, oxygen_saturation, weight, height, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Vital signs not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete vital signs
const deleteVitalSigns = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM vital_signs WHERE vital_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Vital signs not found' });
    }
    res.json({ message: 'Vital signs deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllVitalSigns,
  getVitalSignsById,
  createVitalSigns,
  updateVitalSigns,
  deleteVitalSigns,
};