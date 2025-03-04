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
    // For 'me' endpoint, require authentication
    if (req.params.username === 'me') {
      if (!req.user) {
        return res.status(401).json({ message: 'No token, authorization denied' });
      }
      // Continue with fetching the current user's profile
      const result = await db.query(
        'SELECT id, username, email, profile_pic, bio, created_at FROM users WHERE id = $1',
        [req.user.id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Fetch counts and return user (rest of the code as before)
      // ...
    } else {
      // For other usernames, don't require authentication
      // This allows viewing others' profiles without logging in
      const result = await db.query(
        'SELECT id, username, profile_pic, bio, created_at FROM users WHERE username = $1',
        [req.params.username]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const userId = result.rows[0].id;
      
      // Get post count
      const postsResult = await db.query(
        'SELECT COUNT(*) FROM posts WHERE user_id = $1',
        [userId]
      );
      
      // Construct user object with defaults
      const user = {
        ...result.rows[0],
        cover_pic: "/placeholder.svg?height=400&width=1200", // Default cover image
        location: "", // Default empty location
        website: "", // Default empty website
        post_count: parseInt(postsResult.rows[0].count || 0),
        follower_count: 0, // Default counts for followers/following
        following_count: 0,
        isFollowing: false
      };
      
      res.json(user);
    }
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

module.exports = router; 