const express = require('express');
const router = express.Router();
const firstAidModel = require('../models/firstAidModel');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Get all first aid recommendations
const getAllRecommendations = async (req, res) => {
  try {
    const recommendations = await firstAidModel.getAllFirstAidRecommendations();
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get recommendation by ID
const getRecommendationById = async (req, res) => {
  try {
    const { id } = req.params;
    const recommendation = await firstAidModel.getFirstAidRecommendationById(id);
    if (!recommendation) {
      return res.status(404).json({ message: 'First aid recommendation not found' });
    }
    res.json(recommendation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get recommendations by condition
const getRecommendationsByCondition = async (req, res) => {
  try {
    const { condition } = req.query;
    if (!condition) {
      return res.status(400).json({ message: 'Condition query parameter is required' });
    }
    const recommendations = await firstAidModel.getRecommendationsByCondition(condition);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new recommendation (admin only)
const createRecommendation = async (req, res) => {
  try {
    const recommendation = await firstAidModel.createFirstAidRecommendation(req.body);
    res.status(201).json(recommendation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update recommendation (admin only)
const updateRecommendation = async (req, res) => {
  try {
    const { id } = req.params;
    const recommendation = await firstAidModel.updateFirstAidRecommendation(id, req.body);
    if (!recommendation) {
      return res.status(404).json({ message: 'First aid recommendation not found' });
    }
    res.json(recommendation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete recommendation (admin only)
const deleteRecommendation = async (req, res) => {
  try {
    const { id } = req.params;
    const recommendation = await firstAidModel.deleteFirstAidRecommendation(id);
    if (!recommendation) {
      return res.status(404).json({ message: 'First aid recommendation not found' });
    }
    res.json({ message: 'First aid recommendation deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

router.get('/', authenticateToken, getAllRecommendations);
router.get('/search', authenticateToken, getRecommendationsByCondition);
router.get('/:id', authenticateToken, getRecommendationById);
router.post('/', authenticateToken, authorizeRoles('Administrator'), createRecommendation);
router.put('/:id', authenticateToken, authorizeRoles('Administrator'), updateRecommendation);
router.delete('/:id', authenticateToken, authorizeRoles('Administrator'), deleteRecommendation);

module.exports = router;