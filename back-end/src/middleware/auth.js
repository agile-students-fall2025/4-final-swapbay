import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

async function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return jwt.verify(token, secret);
}

export async function authRequired(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const payload = await verifyToken(token);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: 'Invalid token' });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export async function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return next();
  try {
    const payload = await verifyToken(token);
    const user = await User.findById(payload.sub);
    if (user) req.user = user;
  } catch {
  }
  next();
}
