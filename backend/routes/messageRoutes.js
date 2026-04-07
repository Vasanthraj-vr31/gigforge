const express = require('express');
const { getMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/:userId', protect, getMessages);

module.exports = router;
