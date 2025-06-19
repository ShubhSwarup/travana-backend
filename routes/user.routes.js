const express = require('express');
const { deleteUser } = require('../controllers/user.controller');
const protect = require('../middlewares/authMiddleware');

const router = express.Router();

router.delete('/me', protect, deleteUser);

module.exports = router;