const express = require('express');
const { createBid, getProjectBids, getMyBids, acceptBid, rejectBid } = require('../controllers/bidController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/', protect, createBid);
router.get('/project/:projectId', protect, getProjectBids);
router.get('/me', protect, getMyBids);
router.put('/:id/accept', protect, acceptBid);
router.put('/:id/reject', protect, rejectBid);

module.exports = router;
