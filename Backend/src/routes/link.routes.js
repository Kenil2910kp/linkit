const router = require('express').Router();
const jwtAuth = require('../middleware/jwt.middleware');
const controller = require('../controllers/link.controller');


router.post('/:collectionId', jwtAuth, controller.create);
router.get('/collection/:collectionId', jwtAuth, controller.getByCollection);
router.put('/:id', jwtAuth, controller.update);
router.delete('/:id', jwtAuth, controller.remove);

module.exports = router;
