
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import uploadRoutes from './routes/uploadRoutes.js';
import authRoutes from './routes/authRoutes.js';
import listingsRoutes from './routes/listingsRoutes.js';
import myItemsRoutes from './routes/myItemsRoutes.js';
import offersRoutes from './routes/offersRoutes.js';
import chatsRoutes from './routes/chatsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'swapbay-backend', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/me/items', myItemsRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/chats', chatsRoutes);
app.use('/api/uploads', uploadRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

export default app;
