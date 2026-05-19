const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const {
  getProfile, updateProfile, updateAvatar, uploadAvatar, addSkill, removeSkill,
} = require('../controllers/profileController');

router.get('/:id', optionalAuth, getProfile);
router.put('/', protect, updateProfile);
router.put('/avatar', protect, updateAvatar);
router.post('/avatar/upload', protect, ...uploadAvatar);
router.post('/skills', protect, addSkill);
router.delete('/skills/:skill', protect, removeSkill);

module.exports = router;
