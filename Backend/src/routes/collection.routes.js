const router = require('express').Router();
const jwtAuth = require('../middleware/jwt.middleware');
const optAuth = require('../middleware/optionalJwt.middleware');
const c = require('../controllers/collection.controller');

// ── Owner CRUD ────────────────────────────────────────────────────────────────
router.post('/', jwtAuth, c.create);
router.get('/', jwtAuth, c.getAll);
router.put('/:id', jwtAuth, c.update);
router.delete('/:id', jwtAuth, c.remove);

// ── Public links view ─────────────────────────────────────────────────────────
router.get('/:id/links', optAuth, c.getPublicLinks);

// ── Visibility & access management ───────────────────────────────────────────
router.patch('/:id/visibility', jwtAuth, c.setVisibility);
router.patch('/:id/allowed-emails', jwtAuth, c.updateAllowedEmails);

// ── Social ────────────────────────────────────────────────────────────────────
router.post('/:id/like', jwtAuth, c.toggleLike);
router.post('/:id/save', jwtAuth, c.toggleSave);
router.post('/:id/copy', jwtAuth, c.copyCollection);
router.get('/saved', jwtAuth, c.getSaved);          // MUST be before /:id routes

// ── Explore & user profiles ───────────────────────────────────────────────────
router.get('/explore', c.explore);           // no auth needed
router.get('/user/:userId/public', c.userPublicCollections);

// ── Protected share link ──────────────────────────────────────────────────────
router.get('/shared/:token', optAuth, c.getByToken);
router.post('/shared/:token/request', optAuth, c.requestAccess);

// ── Access request actions (owner) ────────────────────────────────────────────
router.post('/requests/:requestId/approve', jwtAuth, c.approveRequest);
router.post('/requests/:requestId/reject', jwtAuth, c.rejectRequest);

// ── Notifications ─────────────────────────────────────────────────────────────
router.get('/notifications', jwtAuth, c.getNotifications);
router.patch('/notifications/read-all', jwtAuth, c.markAllNotificationsRead);
router.patch('/notifications/:notifId', jwtAuth, c.markNotificationRead);

module.exports = router;
