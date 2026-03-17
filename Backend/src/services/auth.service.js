const User = require('../model/user.model');
const { hashPassword, comparePassword } = require('../utilites/hash');
const { generateToken } = require('../utilites/token');

exports.signup = async ({username, email, password }) => {
  const exists = await User.findOne({ email });
  if (exists) throw new Error('User already exists');

  const hashed = await hashPassword(password);
  const user = await User.create({ username, email, password: hashed,emailVerified:false});
  const token = generateToken({ userId: user._id }); 
  return {token,userId:user._id};
};
 
exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');
  if (user.authProvider === 'google' && !user.password) {
    throw new Error('Please login with Google for this account');
  }
  if (!user.emailVerified) {
    throw new Error('Please verify your email before logging in');
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) throw new Error('Invalid password');

  const token = generateToken({ userId: user._id });
  return {
    token,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email
    }
  };
};
