const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/jwt.middleware');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const User = require('../model/user.model');
    const user = await User.findById(req.userId).select('_id username email');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});
router.post('/verify-email', authController.verifyEmail);
router.post('/google', authController.googleAuth);

module.exports = router;

