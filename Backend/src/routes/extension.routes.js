const router = require('express').Router();
const apiKeyAuth = require('../middleware/apiKeyAuth');
const extensionController = require('../controllers/extension.controller');

router.get('/favorites', apiKeyAuth, extensionController.getFavorites);
router.post('/add-current-tab', apiKeyAuth, extensionController.addCurrentTab);

// Get collections allowed for extension
router.get('/collections',apiKeyAuth ,extensionController.getCollections);

// Add link to a collection
router.post(
  '/collections/:collectionId/links', apiKeyAuth,extensionController.addLinkToCollection
);

module.exports = router;
