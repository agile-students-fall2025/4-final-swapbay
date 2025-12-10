import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { User, Item, Offer, Chat } from '../models/index.js';
import { toPublicUser } from '../utils/serializers.js';
import { authRequired } from '../middleware/auth.js';
import { sendPasswordResetEmail } from '../utils/email.js';

const router = express.Router();

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return jwt.sign({ sub: userId }, secret, { expiresIn: '7d' });
}

const RESET_TOKEN_EXPIRATION_MS = 1000 * 60 * 60; // 1 hour

function buildResetUrl(token) {
  const baseUrl =
    process.env.FRONTEND_URL ||
    process.env.APP_BASE_URL ||
    'http://localhost:5173';
  const normalized = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalized}/reset-password-confirm?token=${token}`;
}

const registrationRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

router.post('/register', registrationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { name, username, email, password } = req.body;
  const normalizedUsername = username.replace(/\s+/g, '').toLowerCase();
  const normalizedEmail = email.toLowerCase();

  const existing = await User.findOne({
    $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
  });
  if (existing) {
    return res.status(409).json({ message: 'Username or email already exists.' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    username: normalizedUsername,
    email: normalizedEmail,
    password: hashed,
    photo: `https://picsum.photos/seed/${normalizedUsername}/200/200`,
  });

  const token = signToken(user._id);
  res.status(201).json({ token, user: toPublicUser(user) });
});

const loginRules = [
  body('email').isEmail().withMessage('Email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

function isValidImageUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  if (value.startsWith('data:')) return false;
  if (value.length > 500) return false;
  return /^https?:\/\/.+/.test(value) || /^\/uploads\/.+/.test(value);
}

router.post('/login', loginRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Invalid email or password.' });

  const token = signToken(user._id);
  res.json({ token, user: toPublicUser(user) });
});

const forgotPasswordRules = [body('email').isEmail().withMessage('Valid email is required')];

router.post('/forgot-password', forgotPasswordRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const normalizedEmail = req.body.email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return res
      .status(404)
      .json({ message: 'Email not found. Please enter the email linked to your account.' });
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_EXPIRATION_MS);
  await user.save();

  try {
    await sendPasswordResetEmail({
      to: user.email,
      name: user.name || user.username,
      resetUrl: buildResetUrl(rawToken),
    });
    return res.json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    console.error('Failed to send password reset email:', error.message);
    return res.status(500).json({ message: 'Unable to send reset email right now. Please try again later.' });
  }
});

const resetPasswordRules = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

router.post('/reset-password', resetPasswordRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { token, password } = req.body;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired reset token.' });
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  res.json({ message: 'Password reset successful. You can now log in.' });
});

router.post('/logout', (_req, res) => {
  res.json({ message: 'Logged out' });
});

router.get('/me', authRequired, (req, res) => {
  res.json({ user: toPublicUser(req.user) });
});

router.put(
  '/me',
  authRequired,
  [
    body('email').optional().isEmail().withMessage('Invalid email'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password too short'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, username, email, password, photo } = req.body;
    const updates = {};

    if (typeof name === 'string') updates.name = name;
    if (typeof photo === 'string') {
      if (!isValidImageUrl(photo)) {
        return res.status(400).json({ message: 'Photo must be a URL (http/https or /uploads/...) and under 500 chars.' });
      }
      updates.photo = photo;
    }

    if (username && username !== req.user.username) {
      const normalizedUsername = username.replace(/\s+/g, '').toLowerCase();
      const usernameTaken = await User.exists({
        username: normalizedUsername,
        _id: { $ne: req.user._id },
      });
      if (usernameTaken) {
        return res.status(409).json({ message: 'Username already taken.' });
      }
      updates.username = normalizedUsername;
    }

    if (email && email !== req.user.email) {
      const normalizedEmail = email.toLowerCase();
      const emailTaken = await User.exists({
        email: normalizedEmail,
        _id: { $ne: req.user._id },
      });
      if (emailTaken) {
        return res.status(409).json({ message: 'Email already taken.' });
      }
      updates.email = normalizedEmail;
    }

    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    const updated = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ user: toPublicUser(updated) });
  },
);

router.delete('/me', authRequired, async (req, res) => {
  const userId = req.user._id;
  await Offer.deleteMany({ $or: [{ buyer: userId }, { seller: userId }] });
  const ownedItems = await Item.find({ owner: userId }, '_id');
  const ownedItemIds = ownedItems.map((it) => it._id);
  if (ownedItemIds.length) {
    await Offer.deleteMany({ listing: { $in: ownedItemIds } });
    await Offer.deleteMany({ myItem: { $in: ownedItemIds } });
  }
  await Item.deleteMany({ owner: userId });
  await Chat.deleteMany({ participants: userId });
  await User.findByIdAndDelete(userId);
  res.json({ message: 'Account deleted' });
});

export default router;
