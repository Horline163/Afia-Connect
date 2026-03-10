const pool = require('../config/db');

const getAllReferrals = async () => {
  const result = await pool.query('SELECT * FROM referrals');
  return result.rows;
};

const getReferralById = async (id) => {
  const result = await pool.query('SELECT * FROM referrals WHERE referral_id = $1', [id]);
  return result.rows[0] || null;
};

const createReferral = async (referralData) => {
  const { patient_id, initiated_by, from_facility_id, to_facility_id, priority, reason, status } = referralData;
  const result = await pool.query(
    'INSERT INTO referrals (patient_id, initiated_by, from_facility_id, to_facility_id, priority, reason, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [patient_id, initiated_by, from_facility_id, to_facility_id, priority, reason, status]
  );
  return result.rows[0];
};

const updateReferral = async (id, referralData) => {
  const { status, completed_at, feedback_notes } = referralData;
  const result = await pool.query(
    'UPDATE referrals SET status = $1, completed_at = $2, feedback_notes = $3 WHERE referral_id = $4 RETURNING *',
    [status, completed_at, feedback_notes, id]
  );
  return result.rows[0] || null;
};

const deleteReferral = async (id) => {
  const result = await pool.query('DELETE FROM referrals WHERE referral_id = $1 RETURNING *', [id]);
  return result.rows[0] || null;
};

module.exports = {
  getAllReferrals,
  getReferralById,
  createReferral,
  updateReferral,
  deleteReferral,
};