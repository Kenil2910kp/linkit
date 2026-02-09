const bcrypt = require('bcrypt');
const authService = require('../services/auth.service');
const Favorite=require('../model/favorite.model');
const AuthToken = require('../model/authToken.model');
const { generateRawToken } = require('../utilites/generateToken');
const sendEmail = require('../services/mailer.service');
const User= require('../model/user.model');

exports.signup = async (req, res) => {
  const { email, password, username } = req.body;
  const user_data = await authService.signup(req.body);
  await Favorite.create({ userId: user_data.userId });
  
  const rawToken = generateRawToken();
  const tokenHash = await bcrypt.hash(rawToken, 12);

  await AuthToken.create({
    userId: user_data.userId,
    tokenHash,
    type: 'EMAIL_VERIFY',
    expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 min
  });

  const verifyUrl = `http://localhost:5500/email-verify?token=${rawToken}`;
  console.log('📨 Sending verification email to:',email);

  await sendEmail.sendMail({
    to: email,
    subject: 'Verify your email',
    html: `
      <p>Click to verify your email:</p>
      <a href="${verifyUrl}">Verify Email</a>
      <p>This link expires in 15 minutes.</p>
    `
  });

  res.status(201).json({
    message: 'Signup successful. Please verify your email.'
  });
};

exports.login = async (req, res) => {

  const data = await authService.login(req.body);

  res.json(data);
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token required' });
  }

  const tokens = await AuthToken.find({
    type: 'EMAIL_VERIFY',
    expiresAt: { $gt: new Date() }
  });

  for (const t of tokens) {
    const match = await bcrypt.compare(token, t.tokenHash);
    if (match) {
      await User.updateOne(
        { _id: t.userId },
        { emailVerified: true }
      );

      await AuthToken.deleteMany({
        userId: t.userId,
        type: 'EMAIL_VERIFY'
      });

      return res.json({ message: 'Email verified successfully' });
    }
  }

  res.status(400).json({ error: 'Invalid or expired token' });
};

