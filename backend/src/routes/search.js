const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const { searchUsers, searchPosts, searchAll } = require('../controllers/searchController');

router.get('/', optionalAuth, searchAll);
router.get('/users', optionalAuth, searchUsers);
router.get('/posts', optionalAuth, searchPosts);

module.exports = router;
