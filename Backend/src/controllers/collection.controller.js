const { v4: uuidv4 } = require('uuid');
const Collection = require('../model/collection.model');
const AccessRequest = require('../model/accessRequest.model');
const Notification = require('../model/notification.model');
const User = require('../model/user.model');
const Link = require('../model/link.model');

// ── helpers ───────────────────────────────────────────────────────────────────
const ownerFields = 'username email';
const publicFields = 'name description visibility likeCount saveCount createdAt userId';

// ── Basic CRUD ─────────────────────────────────────────────────────────────────
exports.create = async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const col = await Collection.create({ name, description, userId: req.userId });
  res.status(201).json(col);
};

exports.getAll = async (req, res) => {
  const cols = await Collection.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(cols);
};

exports.update = async (req, res) => {
  const { name, description } = req.body;
  const updated = await Collection.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { name, description },
    { new: true }
  );
  if (!updated) return res.status(404).json({ error: 'Collection not found' });
  res.json(updated);
};

exports.remove = async (req, res) => {
  const deleted = await Collection.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!deleted) return res.status(404).json({ error: 'Collection not found' });
  res.json({ message: 'Collection deleted' });
};

// ── Public/protected links (for Explore & Saved cards) ────────────────────────
exports.getPublicLinks = async (req, res) => {
  const col = await Collection.findById(req.params.id).lean();
  if (!col) return res.status(404).json({ error: 'Not found' });

  const ownerStr = col.userId?.toString();
  const requesterStr = req.userId?.toString();

  // Owner always has access
  if (requesterStr && requesterStr === ownerStr) {
    const links = await Link.find({ collectionId: col._id }).sort({ createdAt: -1 });
    return res.json(links);
  }
  // Public — anyone can view
  if (col.visibility === 'public') {
    const links = await Link.find({ collectionId: col._id }).sort({ createdAt: -1 });
    return res.json(links);
  }
  // Protected — check allowedEmails
  const email = (req.query.email || '').toLowerCase();
  if (col.visibility === 'protected' && email && col.allowedEmails.includes(email)) {
    const links = await Link.find({ collectionId: col._id }).sort({ createdAt: -1 });
    return res.json(links);
  }
  res.status(403).json({ error: 'Access denied' });
};

// ── Visibility ─────────────────────────────────────────────────────────────────
exports.setVisibility = async (req, res) => {
  const { visibility } = req.body;
  if (!['private', 'protected', 'public'].includes(visibility))
    return res.status(400).json({ error: 'Invalid visibility value' });

  const update = { visibility };
  if (visibility === 'protected') {
    // Generate a unique share token if one doesn't exist yet
    const existing = await Collection.findOne({ _id: req.params.id, userId: req.userId });
    if (!existing) return res.status(404).json({ error: 'Collection not found' });
    if (!existing.sharedToken) update.sharedToken = uuidv4();
  }

  const col = await Collection.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    update,
    { new: true }
  );
  if (!col) return res.status(404).json({ error: 'Collection not found' });
  res.json(col);
};

// ── Allowed emails (protected) ─────────────────────────────────────────────────
exports.updateAllowedEmails = async (req, res) => {
  const { add = [], remove = [] } = req.body;
  const col = await Collection.findOne({ _id: req.params.id, userId: req.userId });
  if (!col) return res.status(404).json({ error: 'Collection not found' });

  let emails = col.allowedEmails || [];
  if (add.length) emails = [...new Set([...emails, ...add.map(e => e.toLowerCase())])];
  if (remove.length) emails = emails.filter(e => !remove.map(r => r.toLowerCase()).includes(e));

  col.allowedEmails = emails;
  await col.save();
  res.json({ allowedEmails: col.allowedEmails });
};

// ── Explore (all public collections) ──────────────────────────────────────────
exports.explore = async (req, res) => {
  const cols = await Collection.find({ visibility: 'public' })
    .sort({ likeCount: -1, createdAt: -1 })
    .populate('userId', ownerFields)
    .lean();

  // Attach linkCount for each collection
  const withCounts = await Promise.all(cols.map(async col => {
    const linkCount = await Link.countDocuments({ collectionId: col._id });
    return { ...col, owner: col.userId, linkCount };
  }));

  res.json(withCounts);
};

// ── User's public collections (profile view) ───────────────────────────────────
exports.userPublicCollections = async (req, res) => {
  const { userId } = req.params;
  const cols = await Collection.find({ userId, visibility: 'public' })
    .sort({ createdAt: -1 })
    .populate('userId', ownerFields)
    .lean();

  const withCounts = await Promise.all(cols.map(async col => {
    const linkCount = await Link.countDocuments({ collectionId: col._id });
    return { ...col, owner: col.userId, linkCount };
  }));

  res.json(withCounts);
};

// ── Like toggle ────────────────────────────────────────────────────────────────
exports.toggleLike = async (req, res) => {
  const col = await Collection.findById(req.params.id);
  if (!col || col.visibility !== 'public') return res.status(404).json({ error: 'Not found' });

  const uid = req.userId.toString();
  const liked = col.likedBy.map(id => id.toString()).includes(uid);

  if (liked) {
    col.likedBy = col.likedBy.filter(id => id.toString() !== uid);
  } else {
    col.likedBy.push(req.userId);
  }
  col.likeCount = col.likedBy.length;
  await col.save();
  res.json({ liked: !liked, likeCount: col.likeCount });
};

// ── Save toggle ────────────────────────────────────────────────────────────────
exports.toggleSave = async (req, res) => {
  const col = await Collection.findById(req.params.id);
  if (!col || col.visibility === 'private') return res.status(404).json({ error: 'Not found' });

  const uid = req.userId.toString();
  const saved = col.savedBy.map(id => id.toString()).includes(uid);

  if (saved) {
    col.savedBy = col.savedBy.filter(id => id.toString() !== uid);
  } else {
    col.savedBy.push(req.userId);
  }
  col.saveCount = col.savedBy.length;
  await col.save();
  res.json({ saved: !saved, saveCount: col.saveCount });
};

// ── My saved collections ───────────────────────────────────────────────────────
exports.getSaved = async (req, res) => {
  const cols = await Collection.find({ savedBy: req.userId, visibility: { $ne: 'private' } })
    .sort({ createdAt: -1 })
    .populate('userId', ownerFields)
    .lean();

  const withCounts = await Promise.all(cols.map(async col => {
    const linkCount = await Link.countDocuments({ collectionId: col._id });
    return { ...col, owner: col.userId, linkCount };
  }));

  res.json(withCounts);
};
// ── Copy a collection into the user's own account ─────────────────────────────
exports.copyCollection = async (req, res) => {
  const source = await Collection.findById(req.params.id).lean();
  if (!source) return res.status(404).json({ error: 'Collection not found' });

  const isOwner = source.userId.toString() === req.userId.toString();
  if (source.visibility === 'private' && !isOwner)
    return res.status(403).json({ error: 'Cannot copy a private collection' });

  // Find a unique name: "Name (Copy)", "Name (Copy 2)", etc.
  const baseName = `${source.name} (Copy)`;
  let candidateName = baseName;
  let suffix = 1;
  while (await Collection.exists({ userId: req.userId, name: candidateName })) {
    suffix++;
    candidateName = `${source.name} (Copy ${suffix})`;
  }

  const newCol = await Collection.create({
    name: candidateName,
    description: source.description,
    userId: req.userId,
    visibility: 'private',
  });

  // Duplicate all links
  const sourceLinks = await Link.find({ collectionId: source._id }).lean();
  if (sourceLinks.length > 0) {
    await Link.insertMany(sourceLinks.map(l => ({
      url: l.url, title: l.title,
      collectionId: newCol._id, userId: req.userId,
    })));
  }

  res.status(201).json({ collection: newCol, linksCopied: sourceLinks.length });
};

// ── Protected collection by share token ────────────────────────────────────────
exports.getByToken = async (req, res) => {
  const col = await Collection.findOne({ sharedToken: req.params.token })
    .populate('userId', ownerFields)
    .lean();

  if (!col) return res.status(404).json({ error: 'Collection not found' });
  if (col.visibility === 'private') return res.status(403).json({ error: 'Access denied' });

  const ownerIdStr = col.userId._id?.toString() || col.userId?.toString();

  // Owner always has access
  if (req.userId && req.userId.toString() === ownerIdStr) {
    const links = await Link.find({ collectionId: col._id }).sort({ createdAt: -1 });
    return res.json({ ...col, owner: col.userId, links, hasAccess: true });
  }

  // If public, anyone can view
  if (col.visibility === 'public') {
    const links = await Link.find({ collectionId: col._id }).sort({ createdAt: -1 });
    return res.json({ ...col, owner: col.userId, links, hasAccess: true });
  }

  // Protected: look up requester email from DB (most reliable) or fall back to query param
  let requesterEmail = (req.query.email || '').toLowerCase();
  if (req.userId && !requesterEmail) {
    const requester = await User.findById(req.userId).select('email').lean();
    if (requester) requesterEmail = requester.email.toLowerCase();
  }

  if (requesterEmail && col.allowedEmails.includes(requesterEmail)) {
    const links = await Link.find({ collectionId: col._id }).sort({ createdAt: -1 });
    return res.json({ ...col, owner: col.userId, links, hasAccess: true });
  }

  // Check the status of the latest access request from this email
  let hasPendingRequest = false;
  let hasRejectedRequest = false;
  if (requesterEmail) {
    const latestReq = await AccessRequest.findOne({
      collectionId: col._id, requesterEmail,
    }).sort({ createdAt: -1 }).lean();
    
    if (latestReq) {
      if (latestReq.status === 'pending') hasPendingRequest = true;
      if (latestReq.status === 'rejected') hasRejectedRequest = true;
    }
  }

  // No access — return collection info + whether they already submitted a request
  res.json({
    _id: col._id,
    name: col.name,
    description: col.description,
    owner: col.userId,
    hasAccess: false,
    hasPendingRequest,
    hasRejectedRequest,
    requesterEmail, // send back so frontend can pre-fill
  });
};


// ── Submit access request ──────────────────────────────────────────────────────
exports.requestAccess = async (req, res) => {
  const { email, message } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const col = await Collection.findOne({ sharedToken: req.params.token }).lean();
  if (!col) return res.status(404).json({ error: 'Collection not found' });
  if (col.visibility !== 'protected') return res.status(400).json({ error: 'This collection is not protected' });
  if (col.allowedEmails.includes(email.toLowerCase()))
    return res.status(400).json({ error: 'You already have access' });

  // Avoid duplicate pending requests
  const existing = await AccessRequest.findOne({
    collectionId: col._id, requesterEmail: email.toLowerCase(), status: 'pending',
  });
  if (existing) return res.status(400).json({ error: 'Access request already pending' });

  const request = await AccessRequest.create({
    collectionId: col._id,
    requesterId: req.userId || null,
    requesterEmail: email.toLowerCase(),
    message: message || '',
  });

  // Notify the collection owner
  await Notification.create({
    userId: col.userId,
    type: 'access_request',
    data: {
      requestId: request._id,
      collectionId: col._id,
      collectionName: col.name,
      requesterEmail: email.toLowerCase(),
      message: message || '',
    },
  });

  res.status(201).json({ message: 'Access request submitted' });
};

// ── Approve access request ─────────────────────────────────────────────────────
exports.approveRequest = async (req, res) => {
  const request = await AccessRequest.findById(req.params.requestId).populate('collectionId');
  if (!request) return res.status(404).json({ error: 'Request not found' });

  const col = request.collectionId;
  if (col.userId.toString() !== req.userId.toString())
    return res.status(403).json({ error: 'Not your collection' });

  // Add to allowedEmails
  if (!col.allowedEmails.includes(request.requesterEmail)) {
    col.allowedEmails.push(request.requesterEmail);
    await col.save();
  }

  request.status = 'approved';
  await request.save();

  // DELETE the notification so it never reappears after refresh
  await Notification.deleteMany({ 'data.requestId': request._id });

  res.json({ message: 'Access granted', email: request.requesterEmail });
};

// ── Reject access request ──────────────────────────────────────────────────────
exports.rejectRequest = async (req, res) => {
  const request = await AccessRequest.findById(req.params.requestId).populate('collectionId');
  if (!request) return res.status(404).json({ error: 'Request not found' });

  const col = request.collectionId;
  if (col.userId.toString() !== req.userId.toString())
    return res.status(403).json({ error: 'Not your collection' });

  request.status = 'rejected';
  await request.save();

  // DELETE the notification so it never reappears after refresh
  await Notification.deleteMany({ 'data.requestId': request._id });
  res.json({ message: 'Request rejected' });
};

// ── Notifications ──────────────────────────────────────────────────────────────
exports.getNotifications = async (req, res) => {
  // Exclude resolved access_request notifications (already approved/rejected but not yet deleted)
  const notifications = await Notification.find({
    userId: req.userId,
    $or: [
      { type: { $ne: 'access_request' } },        // non-request notifications always shown
      { type: 'access_request', read: false },     // only unresolved access requests
    ],
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  res.json(notifications);
};

exports.markNotificationRead = async (req, res) => {
  await Notification.updateOne({ _id: req.params.notifId, userId: req.userId }, { read: true });
  res.json({ message: 'Marked as read' });
};

exports.markAllNotificationsRead = async (req, res) => {
  await Notification.updateMany({ userId: req.userId, read: false }, { read: true });
  res.json({ message: 'All marked as read' });
};
