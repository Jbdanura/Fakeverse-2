const express = require('express');
const auth = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// Get notification count
router.get('/count', auth, async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = false',
      [req.user.id]
    );
    
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    next(err);
  }
});

// Get notifications
router.get('/', auth, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT n.*, u.username, u.profile_pic 
       FROM notifications n
       LEFT JOIN users u ON n.actor_id = u.id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC
       LIMIT 20`,
      [req.user.id]
    );
    
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Mark notification as read
router.post('/:id/read', auth, async (req, res, next) => {
  try {
    await db.query(
      'UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
});

module.exports = router; 