const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/jwt.middleware');
const controller = require('../controllers/apiKey.controller');

router.post('/', authMiddleware, controller.createApiKey);
router.get('/', authMiddleware, controller.getApiKeys);
router.delete('/:id', authMiddleware, controller.deleteApiKey);

module.exports = router;
