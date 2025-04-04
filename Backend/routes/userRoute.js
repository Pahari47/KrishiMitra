const express = require('express');
const router = express.Router();
const {
  syncUserFromClerk,
  getAllUsers
} = require('../controllers/userController');

// POST /api/users/sync (sync Clerk user to DB)
router.post('/sync', syncUserFromClerk);

// GET /api/users (get all users - for testing)
router.get('/', getAllUsers);

module.exports = router;