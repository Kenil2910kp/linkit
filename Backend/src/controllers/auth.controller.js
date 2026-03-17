const bcrypt = require('bcrypt');
const authService = require('../services/auth.service');
const Favorite = require('../model/favorite.model');
const AuthToken = require('../model/authToken.model');
const { generateRawToken } = require('../utilites/generateToken');
const sendEmail = require('../services/mailer.service');
const User = require('../model/user.model');
const { generateToken } = require('../utilites/token');
const { OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

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
    expiresAt: new Date(Date.now() + 15 * 60 * 1000)
  });

  const verifyUrl = `http://localhost:5500/email-verify.html?token=${rawToken}`;
  console.log('📨 Sending verification email to:', email);

  await sendEmail.sendMail({
    to: email,
    subject: 'Verify your email',
    html: `
      <p>Click to verify your email:</p>
      <a href="${verifyUrl}">Verify Email</a>
      <p>This link expires in 15 minutes.</p>
    `
  });

  res.status(201).json({ message: 'Signup successful. Please verify your email.' });
};

exports.login = async (req, res) => {
  const data = await authService.login(req.body);
  res.json(data);
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token required' });

  const tokens = await AuthToken.find({ type: 'EMAIL_VERIFY', expiresAt: { $gt: new Date() } });

  for (const t of tokens) {
    const match = await bcrypt.compare(token, t.tokenHash);
    if (match) {
      await User.updateOne({ _id: t.userId }, { emailVerified: true });
      await AuthToken.deleteMany({ userId: t.userId, type: 'EMAIL_VERIFY' });
      return res.json({ message: 'Email verified successfully' });
    }
  }

  res.status(400).json({ error: 'Invalid or expired token' });
};

exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Google credential required' });

    // Verify the token from Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    if (!email) return res.status(400).json({ error: 'Could not get email from Google' });

    // Find or create user
    let user = await User.findOne({ email });
    let isNew = false;

    if (!user) {
      // Create new Google user — no real password needed
      const randomPass = await bcrypt.hash(googleId + Date.now(), 10);
      user = await User.create({
        username: name || email.split('@')[0],
        email,
        password: randomPass,
        emailVerified: true,
        authProvider: 'google',
      });
      // Create favorites bucket for the new user
      await Favorite.create({ userId: user._id });
      isNew = true;
    } else if (!user.emailVerified) {
      // Mark verified since Google already verified it
      await User.updateOne({ _id: user._id }, { emailVerified: true });
      user.emailVerified = true;
    }

    const token = generateToken({ userId: user._id });
    res.json({
      token,
      user: { _id: user._id, username: user.username, email: user.email },
      isNew,
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(401).json({ error: 'Invalid Google credential' });
  }
};


