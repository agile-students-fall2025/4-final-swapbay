import express from 'express';
import { store, sanitizeUser, getCurrentUser, setCurrentUser, nextId } from '../data/mockStore.js';

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = store.users.find(
    (candidate) => candidate.email.toLowerCase() === email.toLowerCase() && candidate.password === password,
  );

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  setCurrentUser(user.username);
  return res.json({ user: sanitizeUser(user) });
});

router.post('/register', (req, res) => {
  const { name, username, email, password } = req.body;

  if (!name || !username || !email || !password) {
    return res.status(400).json({ message: 'Name, username, email and password are required.' });
  }

  const normalizedUsername = username.replace(/\s+/g, '').toLowerCase();
  const normalizedEmail = email.toLowerCase();

  const usernameTaken = store.users.some((user) => user.username === normalizedUsername);
  const emailTaken = store.users.some((user) => user.email === normalizedEmail);

  if (usernameTaken || emailTaken) {
    return res.status(409).json({ message: 'Username or email already exists.' });
  }

  const newUser = {
    id: nextId('users'),
    name,
    username: normalizedUsername,
    email: normalizedEmail,
    password,
    photo: `https://picsum.photos/seed/${normalizedUsername}/200/200`,
  };

  store.users.push(newUser);
  setCurrentUser(newUser.username);

  return res.status(201).json({ user: sanitizeUser(newUser) });
});

router.post('/logout', (_req, res) => {
  store.currentUser = null;
  res.json({ message: 'Logged out' });
});

router.get('/me', (_req, res) => {
  const user = getCurrentUser();
  if (!user) return res.status(401).json({ message: 'Not authenticated' });
  res.json({ user: sanitizeUser(user) });
});

router.put('/me', (req, res) => {
  const user = getCurrentUser();
  if (!user) return res.status(401).json({ message: 'Not authenticated' });

  const { name, username, email, photo } = req.body;

  if (username && username !== user.username) {
    const normalizedUsername = username.replace(/\s+/g, '').toLowerCase();
    const usernameTaken = store.users.some(
      (candidate) => candidate.username === normalizedUsername && candidate.id !== user.id,
    );
    if (usernameTaken) {
      return res.status(409).json({ message: 'Username already taken.' });
    }
    user.username = normalizedUsername;
    setCurrentUser(normalizedUsername);
  }

  if (email && email !== user.email) {
    const normalizedEmail = email.toLowerCase();
    const emailTaken = store.users.some(
      (candidate) => candidate.email === normalizedEmail && candidate.id !== user.id,
    );
    if (emailTaken) {
      return res.status(409).json({ message: 'Email already taken.' });
    }
    user.email = normalizedEmail;
  }

  if (typeof name === 'string') user.name = name;
  if (typeof photo === 'string') user.photo = photo;

  res.json({ user: sanitizeUser(user) });
});

router.delete('/me', (_req, res) => {
  const user = getCurrentUser();
  if (!user) return res.status(401).json({ message: 'Not authenticated' });

  store.users = store.users.filter((candidate) => candidate.id !== user.id);
  store.items = store.items.filter((item) => item.ownerUsername !== user.username);
  store.offers = store.offers.filter(
    (offer) => offer.buyerUsername !== user.username && offer.sellerUsername !== user.username,
  );
  store.currentUser = null;

  res.json({ message: 'Account deleted' });
});

export default router;