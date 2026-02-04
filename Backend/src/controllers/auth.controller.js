const authService = require('../services/auth.service');
const Favorite=require('../model/favorite.model');

exports.signup = async (req, res) => {
  const user_data = await authService.signup(req.body);
  await Favorite.create({ userId: user_data.userId });
  console.log("hi");
  res.json(user_data.token);

};

exports.login = async (req, res) => {
  const data = await authService.login(req.body);
  res.json(data);
};
