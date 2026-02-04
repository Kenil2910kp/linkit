const Favorite = require('../model/favorite.model');
const FavoriteLink = require('../model/favoriteLink.model');


exports.addFavoriteLink = async (req, res) => {
    try {
      const userId = req.userId;
      const { title, url } = req.body;
  
      if (!title || !url) {
        return res.status(400).json({ error: 'Title and URL are required' });
      }
  
      // 1️⃣ Get user's favorite (must already exist)
      const favorite = await Favorite.findOne({ userId });
  
      if (!favorite) {
        return res.status(404).json({ error: 'Favorite not found' });
      }
  
      // 2️⃣ Prevent duplicate URLs (important UX)
      const exists = await FavoriteLink.findOne({
        favoriteId: favorite._id,
        url
      });
  
      if (exists) {
        return res.status(409).json({ error: 'Link already in favorites' });
      }
  
      // 3️⃣ Create favorite link
      const link = await FavoriteLink.create({
        favoriteId: favorite._id,
        title,
        url
      });
  
      res.status(201).json(link);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to add favorite link' });
    }
  };

exports.getFavoriteMeta = async (req, res) => {
  const favorite = await Favorite.findOne({ userId: req.userId });

  const count = await FavoriteLink.countDocuments({
    favoriteId: favorite._id
  });

  res.json({
    createdAt: favorite.createdAt,
    linkCount: count
  });
};

exports.getFavoriteLinks = async (req, res) => {
  const favorite = await Favorite.findOne({ userId: req.userId });

  const links = await FavoriteLink.find({
    favoriteId: favorite._id
  }).sort({ createdAt: -1 });

  res.json(links);
};

exports.deleteFavoriteLink = async (req, res) => {
  const favorite = await Favorite.findOne({ userId: req.userId });

  await FavoriteLink.deleteOne({
    _id: req.params.id,
    favoriteId: favorite._id
  });

  res.json({ success: true });
};
