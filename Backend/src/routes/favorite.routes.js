const router = require('express').Router();
const auth = require('../middleware/jwt.middleware');
const favoriteController = require('../controllers/favorite.controller');

router.get('/', auth, favoriteController.getFavoriteMeta);
router.get('/links', auth, favoriteController.getFavoriteLinks);
router.post('/links', auth, favoriteController.addFavoriteLink);
router.delete('/links/:id', auth, favoriteController.deleteFavoriteLink);


module.exports = router;
