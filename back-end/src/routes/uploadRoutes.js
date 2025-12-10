import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();
router.use(authRequired);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const makeStorage = (folder) =>
  multer.diskStorage({
    destination: path.join(__dirname, '..', '..', 'public', 'uploads', folder),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  });

const fileFilter = (_req, file, cb) => {
  const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
  cb(ok ? null : new Error('Invalid file type'), ok);
};

const avatarLimits = { fileSize: 5 * 1024 * 1024 };
const itemLimits = { fileSize: 5 * 1024 * 1024 };

router.post(
  '/avatar',
  multer({ storage: makeStorage('avatars'), fileFilter, limits: avatarLimits }).single('image'),
  (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const base = `${req.protocol}://${req.get('host')}`;
    res.json({ url: `${base}/uploads/avatars/${req.file.filename}` });
  },
);

router.post(
  '/item',
  multer({ storage: makeStorage('items'), fileFilter, limits: itemLimits }).single('image'),
  (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const base = `${req.protocol}://${req.get('host')}`;
    res.json({ url: `${base}/uploads/items/${req.file.filename}` });
  },
);

export default router;
