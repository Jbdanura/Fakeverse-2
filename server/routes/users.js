const express = require('express');
const auth = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// Get current user
router.get('/me', auth, async (req, res, next) => {
  try {
    // Only select columns that actually exist in your database
    const result = await db.query(
      'SELECT id, username, email, profile_pic, bio, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get post count
    const postsResult = await db.query(
      'SELECT COUNT(*) FROM posts WHERE user_id = $1',
      [req.user.id]
    );
    
    // Add default values for fields that might be expected by the frontend
    const user = {
      ...result.rows[0],
      // Add these default values for any fields the frontend expects but aren't in the database
      cover_pic: "/placeholder.svg?height=400&width=1200",
      location: "",
      website: "",
      post_count: parseInt(postsResult.rows[0].count || 0),
      follower_count: 0,
      following_count: 0
    };
    
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Get user by username
router.get('/:username', async (req, res, next) => {
  try {
    // If username is 'me', get the current user's profile
    const username = req.params.username;
    const isCurrentUser = username === 'me';
    
    // For 'me' endpoint, we need authentication
    if (isCurrentUser && !req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Get user ID - either from req.user (for 'me') or by querying the username
    let userId;
    if (isCurrentUser) {
      userId = req.user.id;
    } else {
      const userResult = await db.query(
        'SELECT id FROM users WHERE username = $1',
        [username]
      );
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      userId = userResult.rows[0].id;
    }
    
    // Get user data
    const result = await db.query(
      'SELECT id, username, email, profile_pic, bio, created_at FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get post count
    const postsResult = await db.query(
      'SELECT COUNT(*) FROM posts WHERE user_id = $1',
      [userId]
    );
    
    // Get follower count - create table if it doesn't exist
    let followerCount = 0;
    try {
      // First, ensure followers table exists
      await db.query(`
        CREATE TABLE IF NOT EXISTS followers (
          id SERIAL PRIMARY KEY,
          follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          followed_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(follower_id, followed_id)
        )
      `);
      
      const followerResult = await db.query(
        'SELECT COUNT(*) FROM followers WHERE followed_id = $1',
        [userId]
      );
      followerCount = parseInt(followerResult.rows[0].count || 0);
    } catch (err) {
      console.log('Error getting follower count:', err.message);
    }
    
    // Get following count
    let followingCount = 0;
    try {
      const followingResult = await db.query(
        'SELECT COUNT(*) FROM followers WHERE follower_id = $1',
        [userId]
      );
      followingCount = parseInt(followingResult.rows[0].count || 0);
    } catch (err) {
      console.log('Error getting following count:', err.message);
    }
    
    // Check if the current user is following this user
    let isFollowing = false;
    if (req.user && req.user.id !== userId) {
      try {
        const followCheck = await db.query(
          'SELECT 1 FROM followers WHERE follower_id = $1 AND followed_id = $2',
          [req.user.id, userId]
        );
        isFollowing = followCheck.rows.length > 0;
      } catch (err) {
        console.log('Error checking follow status:', err.message);
      }
    }
    
    // Construct user object with counts
    const user = {
      ...result.rows[0],
      cover_pic: "/placeholder.svg?height=400&width=1200",
      location: "",
      website: "",
      post_count: parseInt(postsResult.rows[0].count || 0),
      follower_count: followerCount,
      following_count: followingCount,
      isFollowing: isFollowing
    };
    
    // Log the user object to verify data
    console.log(`User profile for ${username}:`, {
      id: user.id,
      username: user.username,
      post_count: user.post_count,
      follower_count: user.follower_count,
      following_count: user.following_count
    });
    
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Get followers
router.get('/:username/followers', async (req, res, next) => {
  try {
    // First get the user ID from username
    const userResult = await db.query(
      'SELECT id FROM users WHERE username = $1',
      [req.params.username]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userId = userResult.rows[0].id;
    
    // Get followers with user details
    const followers = await db.query(
      `SELECT u.id, u.username, u.name, u.profile_pic, u.bio,
       EXISTS(SELECT 1 FROM followers WHERE follower_id = $1 AND followed_id = u.id) as is_following
       FROM followers f
       JOIN users u ON f.follower_id = u.id
       WHERE f.followed_id = $2`,
      [req.user ? req.user.id : null, userId]
    );
    
    res.json(followers.rows);
  } catch (err) {
    next(err);
  }
});

// Get following
router.get('/:username/following', async (req, res, next) => {
  try {
    // First get the user ID from username
    const userResult = await db.query(
      'SELECT id FROM users WHERE username = $1',
      [req.params.username]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userId = userResult.rows[0].id;
    
    // Get users that this user follows
    const following = await db.query(
      `SELECT u.id, u.username, u.name, u.profile_pic, u.bio,
       EXISTS(SELECT 1 FROM followers WHERE follower_id = $1 AND followed_id = u.id) as is_following
       FROM followers f
       JOIN users u ON f.followed_id = u.id
       WHERE f.follower_id = $2`,
      [req.user ? req.user.id : null, userId]
    );
    
    res.json(following.rows);
  } catch (err) {
    next(err);
  }
});

// Follow a user
router.post('/:userId/follow', auth, async (req, res, next) => {
  try {
    const followedId = req.params.userId;
    
    // Check if already following
    const existingFollow = await db.query(
      'SELECT * FROM followers WHERE follower_id = $1 AND followed_id = $2',
      [req.user.id, followedId]
    );
    
    if (existingFollow.rows.length > 0) {
      return res.json({ message: 'Already following this user' });
    }
    
    // Create follow relationship
    await db.query(
      'INSERT INTO followers (follower_id, followed_id) VALUES ($1, $2)',
      [req.user.id, followedId]
    );
    
    res.status(201).json({ message: 'Successfully followed user' });
  } catch (err) {
    next(err);
  }
});

// Unfollow a user
router.post('/:userId/unfollow', auth, async (req, res, next) => {
  try {
    const followedId = req.params.userId;
    
    await db.query(
      'DELETE FROM followers WHERE follower_id = $1 AND followed_id = $2',
      [req.user.id, followedId]
    );
    
    res.json({ message: 'Successfully unfollowed user' });
  } catch (err) {
    next(err);
  }
});

// Update user profile
router.put('/me', auth, async (req, res, next) => {
  try {
    const { bio, profile_pic } = req.body;
    
    const result = await db.query(
      'UPDATE users SET bio = $1, profile_pic = $2 WHERE id = $3 RETURNING id, username, email, profile_pic, bio',
      [bio, profile_pic, req.user.id]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Add this route to search for users
router.get('/search', async (req, res, next) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Search users by username or name that starts with the query
    const result = await db.query(
      `SELECT id, username, profile_pic, bio FROM users 
       WHERE username ILIKE $1 
       ORDER BY username 
       LIMIT 10`,
      [`${query}%`]
    );
    
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router; 