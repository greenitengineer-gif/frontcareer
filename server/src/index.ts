import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import next from 'next';

import authRoutes from './routes/auth.routes';
import listingRoutes from './routes/listing.routes';
import favoriteRoutes from './routes/favorite.routes';
import adminRoutes from './routes/admin.routes';
import aiRoutes from './routes/ai.routes';
import cvRoutes from './routes/cv.routes';
import statsRoutes from './routes/stats.routes';
import jobApplicationRoutes from './routes/job-application.routes';
import notificationRoutes from './routes/notification.routes';

dotenv.config();

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev, dir: path.join(__dirname, '../../client') });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const app = express();
  const server = http.createServer(app);

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/listings', listingRoutes);
  app.use('/api/favorites', favoriteRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/cv', cvRoutes);
  app.use('/api/stats', statsRoutes);
  app.use('/api/job-applications', jobApplicationRoutes);
  app.use('/api/notifications', notificationRoutes);

  // Health check for API
  app.get('/api/health', (req, res) => {
    res.send('Career API is running');
  });

  // Next.js handler for all other routes
  app.all('*', (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Amjilttai aslaa ${PORT}`);
  });
});
