const { Pool } = require('pg');
require('dotenv').config();

// Use the DATABASE_URL from your .env file
const connectionString = process.env.DATABASE_URL;
console.log('Attempting to connect to: ', connectionString);

const pool = new Pool({
  connectionString: connectionString
});

async function testConnection() {
  let client;
  
  try {
    // Try to connect
    client = await pool.connect();
    console.log('✅ Successfully connected to the database!');
    
    // Test a simple query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Query executed successfully');
    console.log('Current database time:', result.rows[0].current_time);
    
    // Get database info
    const dbInfoResult = await client.query('SELECT current_database() as db_name');
    console.log('Connected to database:', dbInfoResult.rows[0].db_name);
    
    // Check if our tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('⚠️ No tables found in the database. You may need to run your schema.sql file.');
    } else {
      console.log('Found tables:');
      tablesResult.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    }
    
  } catch (err) {
    console.error('❌ Database connection error:', err);
    console.log('\nPossible solutions:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Check your DATABASE_URL in .env file');
    console.log('3. Verify database "fakeverse2" exists');
    console.log('4. Check username/password in connection string');
  } finally {
    // Release the client back to the pool
    if (client) client.release();
    // Close the pool to end the process
    await pool.end();
  }
}

testConnection(); 