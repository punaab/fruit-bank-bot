import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from 'dotenv';
import { apiLimiter } from './middleware/rateLimit.js';

// Import routes
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import leaderboardRoutes from './routes/leaderboard.js';
import stripeRoutes from './routes/stripe.js';

// Load environment variables
config();

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configure CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Apply rate limiting to all routes
app.use(apiLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/stripe', stripeRoutes);

// Serve static files from the React app
const clientPath = path.join(process.cwd(), 'dist/client');
console.log('Serving static files from:', clientPath);
app.use(express.static(clientPath));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  const indexPath = path.join(clientPath, 'index.html');
  console.log('Serving index.html from:', indexPath);
  res.sendFile(indexPath);
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log('Connected to MongoDB');
    // Start the server
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });