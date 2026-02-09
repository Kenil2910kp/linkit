const router = require('express').Router();
const apiKeyAuth = require('../middleware/apiKeyAuth');
const extensionController = require('../controllers/extension.controller');

router.get('/favorites', apiKeyAuth, extensionController.getFavorites);
router.post('/add-current-tab', apiKeyAuth, extensionController.addCurrentTab);

router.get('/collections',apiKeyAuth ,extensionController.getCollections);

router.post(
  '/collections/:collectionId/links', apiKeyAuth,extensionController.addLinkToCollection
);

module.exports = router;
