const pool = require('../config/db');

// Get all referrals
const getAllReferrals = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM referrals');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get referral by ID
const getReferralById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM referrals WHERE referral_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Referral not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new referral
const createReferral = async (req, res) => {
  try {
    const { patient_id, initiated_by, from_facility_id, to_facility_id, priority, reason, status } = req.body;
    const result = await pool.query(
      'INSERT INTO referrals (patient_id, initiated_by, from_facility_id, to_facility_id, priority, reason, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [patient_id, initiated_by, from_facility_id, to_facility_id, priority, reason, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update referral
const updateReferral = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, completed_at, feedback_notes } = req.body;
    const result = await pool.query(
      'UPDATE referrals SET status = $1, completed_at = $2, feedback_notes = $3 WHERE referral_id = $4 RETURNING *',
      [status, completed_at, feedback_notes, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Referral not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete referral
const deleteReferral = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM referrals WHERE referral_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Referral not found' });
    }
    res.json({ message: 'Referral deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllReferrals,
  getReferralById,
  createReferral,
  updateReferral,
  deleteReferral,
};