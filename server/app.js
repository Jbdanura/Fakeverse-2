const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const authRoutes = require('./routes/auth');
const searchRoutes = require('./routes/search');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-production-domain.com' 
    : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/search', searchRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Test database connection before starting the server
async function testDbAndStartServer() {
  try {
    // Test query to check DB connection
    const result = await db.query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful!');
    console.log('Connected to database, current time:', result.rows[0].current_time);
    
    // Check if tables exist
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('Database tables found:');
    if (tablesResult.rows.length === 0) {
      console.log('⚠️ No tables found! You may need to run your schema.sql file.');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    }
    
    // Start the server after successful DB connection
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    
  } catch (err) {
    console.error('❌ Database connection error:', err);
    console.log('\nPossible solutions:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Check your DATABASE_URL in .env file');
    console.log('3. Verify database "fakeverse2" exists');
    console.log('4. Check username/password in connection string');
    process.exit(1); // Exit with error
  }
}

// Run the function to test DB and start server
testDbAndStartServer(); 