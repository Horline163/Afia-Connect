const pool = require('../config/db');

const auditLog = async (req, res, next) => {
  const originalSend = res.send;
  let responseBody;

  // Capture response body
  res.send = function(data) {
    responseBody = data;
    originalSend.call(this, data);
  };

  res.on('finish', async () => {
    try {
      if (req.user && req.user.user_id) {
        const { user_id } = req.user;
        const action = req.method;
        const entity_name = req.baseUrl + req.path;
        const entity_id = req.params.id || null;
        const old_value = null; // For simplicity, not tracking old values
        const new_value = req.method === 'POST' || req.method === 'PUT' ? JSON.stringify(req.body) : null;
        const ip_address = req.ip || req.connection.remoteAddress;

        await pool.query(
          'INSERT INTO audit_logs (user_id, action, entity_name, entity_id, old_value, new_value, ip_address) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [user_id, action, entity_name, entity_id, old_value, new_value, ip_address]
        );
      }
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  });

  next();
};

module.exports = {
  auditLog,
};