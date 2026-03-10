const pool = require('../config/db');

const getAllFirstAidRecommendations = async () => {
  const result = await pool.query('SELECT * FROM first_aid_recommendations');
  return result.rows;
};

const getFirstAidRecommendationById = async (id) => {
  const result = await pool.query('SELECT * FROM first_aid_recommendations WHERE recommendation_id = $1', [id]);
  return result.rows[0] || null;
};

const getRecommendationsByCondition = async (condition) => {
  const result = await pool.query('SELECT * FROM first_aid_recommendations WHERE condition ILIKE $1', [`%${condition}%`]);
  return result.rows;
};

const createFirstAidRecommendation = async (recommendationData) => {
  const { condition, symptom_pattern, vital_thresholds, action_text, medication_text, referral_advice, source_guideline } = recommendationData;
  const result = await pool.query(
    'INSERT INTO first_aid_recommendations (condition, symptom_pattern, vital_thresholds, action_text, medication_text, referral_advice, source_guideline) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [condition, symptom_pattern, vital_thresholds, action_text, medication_text, referral_advice, source_guideline]
  );
  return result.rows[0];
};

const updateFirstAidRecommendation = async (id, recommendationData) => {
  const { condition, symptom_pattern, vital_thresholds, action_text, medication_text, referral_advice, source_guideline } = recommendationData;
  const result = await pool.query(
    'UPDATE first_aid_recommendations SET condition = $1, symptom_pattern = $2, vital_thresholds = $3, action_text = $4, medication_text = $5, referral_advice = $6, source_guideline = $7 WHERE recommendation_id = $8 RETURNING *',
    [condition, symptom_pattern, vital_thresholds, action_text, medication_text, referral_advice, source_guideline, id]
  );
  return result.rows[0] || null;
};

const deleteFirstAidRecommendation = async (id) => {
  const result = await pool.query('DELETE FROM first_aid_recommendations WHERE recommendation_id = $1 RETURNING *', [id]);
  return result.rows[0] || null;
};

module.exports = {
  getAllFirstAidRecommendations,
  getFirstAidRecommendationById,
  getRecommendationsByCondition,
  createFirstAidRecommendation,
  updateFirstAidRecommendation,
  deleteFirstAidRecommendation,
};