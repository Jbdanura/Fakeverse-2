const express = require('express');
const auth = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// Get unread message count
router.get('/count', auth, async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT COUNT(*) FROM messages WHERE receiver_id = $1 AND read = false',
      [req.user.id]
    );
    
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    next(err);
  }
});

// Get chat list with unread counts
router.get('/chats', auth, async (req, res, next) => {
  try {
    // Get all users the current user has exchanged messages with
    const result = await db.query(
      `SELECT DISTINCT
        CASE
          WHEN m.sender_id = $1 THEN m.receiver_id
          ELSE m.sender_id
        END as user_id,
        u.username,
        u.name,
        u.profile_pic,
        (
          SELECT content 
          FROM messages 
          WHERE 
            (sender_id = $1 AND receiver_id = u.id) OR 
            (receiver_id = $1 AND sender_id = u.id)
          ORDER BY created_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT created_at 
          FROM messages 
          WHERE 
            (sender_id = $1 AND receiver_id = u.id) OR 
            (receiver_id = $1 AND sender_id = u.id)
          ORDER BY created_at DESC 
          LIMIT 1
        ) as last_message_time,
        (
          SELECT COUNT(*) 
          FROM messages 
          WHERE sender_id = u.id AND receiver_id = $1 AND read = false
        ) as unread_count
      FROM messages m
      JOIN users u ON 
        (m.sender_id = $1 AND m.receiver_id = u.id) OR 
        (m.receiver_id = $1 AND m.sender_id = u.id)
      ORDER BY last_message_time DESC`,
      [req.user.id]
    );
    
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router; 