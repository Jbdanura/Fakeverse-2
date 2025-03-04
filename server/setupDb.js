const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function setupDatabase() {
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Connecting to database...');
    const client = await pool.connect();
    
    try {
      console.log('Running schema commands...');
      await client.query(schema);
      console.log('✅ Database schema successfully applied!');
      
      // Verify tables were created
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);
      
      console.log('\nTables created:');
      tablesResult.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
      
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    await pool.end();
  }
}

setupDatabase(); 