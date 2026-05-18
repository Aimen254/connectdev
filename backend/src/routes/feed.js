const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const {
  createPost, getFeed, getUserPosts, getPost,
  updatePost, deletePost, toggleLike,
  getComments, addComment, deleteComment,
} = require('../controllers/feedController');

router.get('/', protect, getFeed);
router.post('/', protect, createPost);

router.get('/user/:id', optionalAuth, getUserPosts);

router.get('/:id', optionalAuth, getPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

router.post('/:id/like', protect, toggleLike);

router.get('/:id/comments', getComments);
router.post('/:id/comments', protect, addComment);
router.delete('/:postId/comments/:commentId', protect, deleteComment);

module.exports = router;
