const Collection = require('../model/collection.model');

exports.createCollection = async (userId, name, description) => {
 const create = await Collection.create({
    name,
    description,
    userId
  });
  return Collection.findOne({ userId, name, description });
};

exports.getCollections = async (userId) => {
  return Collection.find({ userId }).sort({ createdAt: -1 });
};

exports.updateCollection = async (userId, collectionId, name, description) => {
  return Collection.findOneAndUpdate(
    { _id: collectionId, userId },
    { name, description },
    { new: true }
  );
};

exports.deleteCollection = async (userId, collectionId) => {
  return Collection.findOneAndDelete({
    _id: collectionId,
    userId
  });
};
