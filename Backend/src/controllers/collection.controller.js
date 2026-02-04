const collectionService = require('../services/collection.service');

exports.create = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const collection = await collectionService.createCollection(
    req.userId,
    name,
    description
  );
 

  res.status(201).json(collection);
};

exports.getAll = async (req, res) => {
  const collections = await collectionService.getCollections(req.userId);
  res.json(collections);
};

exports.update = async (req, res) => {
  const { name, description } = req.body;
  const { id } = req.params;

  const updated = await collectionService.updateCollection(
    req.userId,
    id,
    name,
    description
  );

  if (!updated) {
    return res.status(404).json({ error: 'Collection not found' });
  }

  res.json(updated);
};

exports.remove = async (req, res) => {
  const { id } = req.params;

  const deleted = await collectionService.deleteCollection(
    req.userId,
    id
  );

  if (!deleted) {
    return res.status(404).json({ error: 'Collection not found' });
  }

  res.json({ message: 'Collection deleted' });
};
