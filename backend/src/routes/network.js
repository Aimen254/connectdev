const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getConnections, getPendingRequests, getSentRequests,
  sendRequest, acceptRequest, rejectRequest,
  removeConnection, cancelRequest, getSuggestions,
} = require('../controllers/networkController');

router.get('/connections', protect, getConnections);
router.get('/requests', protect, getPendingRequests);
router.get('/sent', protect, getSentRequests);
router.get('/suggestions', protect, getSuggestions);

router.post('/request/:id', protect, sendRequest);
router.put('/request/:connectionId/accept', protect, acceptRequest);
router.put('/request/:connectionId/reject', protect, rejectRequest);
router.delete('/request/:id/cancel', protect, cancelRequest);

router.delete('/connections/:id', protect, removeConnection);

module.exports = router;
