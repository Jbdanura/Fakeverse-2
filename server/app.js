const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const authRoutes = require('./routes/auth');
const searchRoutes = require('./routes/search');
const db = require('./db');
const jwt = require('jsonwebtoken');
const initDatabase = require('./db-init');

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
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/comments', require('./routes/comments'));

// Add this route for development only
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/debug', require('./routes/debug'));
}

// Add this middleware to populate req.user for all routes
app.use(async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret-key');
        
        // Add user id to request
        req.user = { id: decoded.user.id };
        
        // Get full user data
        const result = await db.query('SELECT id, username, email FROM users WHERE id = $1', [req.user.id]);
        
        if (result.rows.length > 0) {
          req.user = result.rows[0];
        }
      } catch (err) {
        // If token verification fails, don't set req.user but don't fail the request
        console.error('JWT verification error:', err.message);
      }
    }
    
    next();
  } catch (err) {
    next(err);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  
  // Send a friendly error message to the client
  res.status(500).json({
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Test database connection before starting the server
async function testDbAndStartServer() {
  try {
    // Test query to check DB connection
    const result = await db.query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful!');
    console.log('Connected to database, current time:', result.rows[0].current_time);
    
    // Check if tables exist and create them if they don't
    try {
      await initDatabase();
    } catch (err) {
      console.error('Error initializing database:', err);
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