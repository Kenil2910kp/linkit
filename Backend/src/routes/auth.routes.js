const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/jwt.middleware');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/me', authMiddleware, (req, res) => {
    res.json({
      user: req.user
    });
});
  
module.exports = router;
