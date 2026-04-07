const express = require('express');
const { createBid, getProjectBids, acceptBid } = require('../controllers/bidController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/', protect, createBid);
router.get('/project/:projectId', protect, getProjectBids);
router.put('/:id/accept', protect, acceptBid);

module.exports = router;
