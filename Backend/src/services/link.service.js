const Link = require('../model/link.model');
const Collection = require('../model/collection.model');

exports.addLink = async (userId, collectionId, url, title) => {
  // 🔐 Ensure collection belongs to user
  const collection = await Collection.findOne({
    _id: collectionId,
    userId
  });

  if (!collection) {
    throw new Error('Collection not found');
  }

  const create_link=await Link.create({
    url,
    title,
    collectionId,
    userId
  });

  return Link.findOne({url,title,userId,collectionId})
};

exports.getLinksByCollection = async (userId, collectionId) => {
  return Link.find({ userId, collectionId }).sort({ createdAt: -1 });
};

exports.updateLink = async (userId, linkId, url, title) => {
  return Link.findOneAndUpdate(
    { _id: linkId, userId },
    { url, title },
    { new: true }
  );
};

exports.deleteLink = async (userId, linkId) => {
  return Link.findOneAndDelete({ _id: linkId, userId });
};
