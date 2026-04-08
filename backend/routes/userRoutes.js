const express = require('express');
const { protect } = require('../middleware/auth');
const { getMe, updateMe, getContacts, getFreelancers, getUserById } = require('../controllers/userController');

const router = express.Router();

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.get('/contacts', protect, getContacts);
router.get('/freelancers', protect, getFreelancers);
router.get('/:id', protect, getUserById);

module.exports = router;

