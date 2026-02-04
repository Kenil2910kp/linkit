const linkService = require('../services/link.service');

exports.create = async (req, res) => {
  const { url, title} = req.body;
  const {collectionId}=req.params;

  if (!url || !title || !collectionId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const link = await linkService.addLink(
    req.userId,
    collectionId,
    url,
    title
  );

  res.status(201).json(link);
};

exports.getByCollection = async (req, res) => {
  const { collectionId } = req.params;

  const links = await linkService.getLinksByCollection(
    req.userId,
    collectionId
  );

  res.json(links);
};

exports.update = async (req, res) => {
  const { url, title } = req.body;
  const { id } = req.params;

  const updated = await linkService.updateLink(
    req.userId,
    id,
    url,
    title
  );

  if (!updated) {
    return res.status(404).json({ error: 'Link not found' });
  }

  res.json(updated);
};

exports.remove = async (req, res) => {
  const { id } = req.params;

  const deleted = await linkService.deleteLink(req.userId, id);

  if (!deleted) {
    return res.status(404).json({ error: 'Link not found' });
  }

  res.json({ message: 'Link deleted' });
};
