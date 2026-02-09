const Favorite = require('../model/favorite.model');
const FavoriteLink = require('../model/favoriteLink.model');
const Collection = require('../model/collection.model');
const Link = require('../model/link.model');


exports.getFavorites = async (req, res) => {
  const favorite = await Favorite.findOne({ userId: req.userId });

  const links = await FavoriteLink.find({
    favoriteId: favorite._id
  }).sort({ createdAt: -1 });

  res.json({
    createdAt: favorite.createdAt,
    linkCount: links.length,
    links
  });
};

exports.addCurrentTab = async (req, res) => {
  const { title, url } = req.body;

  const favorite = await Favorite.findOne({ userId: req.userId });

  const link = await FavoriteLink.create({
    favoriteId: favorite._id,
    title,
    url
  });

  res.json(link);
};

exports.getCollections = async (req, res) => {
    const userId = req.userId;
  
    const collections = await Collection.find({
      userId,
      extensionEnabled: true
    })
      .sort({ createdAt: -1 })
      .lean();
  
    res.json(
      collections.map(c => ({
        _id: c._id,
        name: c.name,
        createdAt: c.createdAt
      }))
    );
  };

  exports.addLinkToCollection = async (req, res) => {
    const userId = req.userId;
    const { collectionId } = req.params;
    const { title, url } = req.body;
  
    if (!title || !url) {
      return res.status(400).json({ message: 'Title and URL required' });
    }

    const collection = await Collection.findOne({
      _id: collectionId,
      userId
    });
  
    if (!collection) {
      return res
        .status(403)
        .json({ message: 'Collection not accessible via extension' });
    }
  
    const link = await Link.create({
      collectionId,
      title,
      url
    });
  
    res.status(201).json(link);
  };
