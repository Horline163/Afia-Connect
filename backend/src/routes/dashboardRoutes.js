const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const stats = {};

    // Total patients
    const patientsResult = await pool.query('SELECT COUNT(*) as total FROM patients');
    stats.totalPatients = parseInt(patientsResult.rows[0].total);

    // Total users
    const usersResult = await pool.query('SELECT COUNT(*) as total FROM users WHERE is_active = true');
    stats.totalUsers = parseInt(usersResult.rows[0].total);

    // Today's appointments
    const today = new Date().toISOString().split('T')[0];
    const appointmentsResult = await pool.query('SELECT COUNT(*) as total FROM appointments WHERE scheduled_date = $1', [today]);
    stats.todayAppointments = parseInt(appointmentsResult.rows[0].total);

    // Pending consultations
    const consultationsResult = await pool.query('SELECT COUNT(*) as total FROM consultations WHERE status IN (\'Requested\', \'Scheduled\')');
    stats.pendingConsultations = parseInt(consultationsResult.rows[0].total);

    // Recent medical records
    const recordsResult = await pool.query('SELECT COUNT(*) as total FROM medical_records WHERE recorded_at >= NOW() - INTERVAL \'7 days\'');
    stats.recentRecords = parseInt(recordsResult.rows[0].total);

    // Immunizations due this month
    const immunizationsResult = await pool.query('SELECT COUNT(*) as total FROM immunizations WHERE next_due_date <= NOW() + INTERVAL \'30 days\' AND next_due_date >= NOW()');
    stats.immunizationsDue = parseInt(immunizationsResult.rows[0].total);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user activity summary
const getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const activity = {};

    // Recent actions from audit log
    const auditResult = await pool.query(
      'SELECT action, entity_name, timestamp FROM audit_logs WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 10',
      [userId]
    );
    activity.recentActions = auditResult.rows;

    // User's patients
    const patientsResult = await pool.query('SELECT COUNT(*) as total FROM patients WHERE created_by = $1', [userId]);
    activity.totalPatients = parseInt(patientsResult.rows[0].total);

    // User's appointments
    const appointmentsResult = await pool.query('SELECT COUNT(*) as total FROM appointments WHERE scheduled_with = $1', [userId]);
    activity.totalAppointments = parseInt(appointmentsResult.rows[0].total);

    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

router.get('/stats', authenticateToken, getDashboardStats);
router.get('/activity/:userId', authenticateToken, getUserActivity);

module.exports = router;