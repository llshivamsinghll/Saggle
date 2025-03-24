const express = require('express');
const { verifyAge } = require('../controllers/verificationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/verify-age', authMiddleware, verifyAge);

module.exports = router;