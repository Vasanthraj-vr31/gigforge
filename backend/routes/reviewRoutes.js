const express = require('express');
const { protect } = require('../middleware/auth');
const { createReview, getUserReviews, getMyReviews } = require('../controllers/reviewController');

const router = express.Router();

router.post('/', protect, createReview);
router.get('/me', protect, getMyReviews);
router.get('/:userId', protect, getUserReviews);

module.exports = router;

