const express = require('express');
const db = require('../db');

const router = express.Router();

// Get table schema for debugging
router.get('/schema/:table', async (req, res, next) => {
  try {
    const { table } = req.params;
    
    // Get column information for the specified table
    const result = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = $1
    `, [table]);
    
    res.json({
      table,
      columns: result.rows
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router; 