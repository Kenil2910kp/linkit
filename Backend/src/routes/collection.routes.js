const router = require('express').Router();
const jwtAuth = require('../middleware/jwt.middleware');
const controller = require('../controllers/collection.controller');

router.post('/', jwtAuth, controller.create);
router.get('/', jwtAuth, controller.getAll);
router.put('/:id', jwtAuth, controller.update);
router.delete('/:id', jwtAuth, controller.remove);

module.exports = router;
