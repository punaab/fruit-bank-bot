import express from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Discord OAuth2 configuration
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'https://fruitbank.xyz/auth/callback';
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

// Discord OAuth2 login
router.get('/discord', (_, res) => {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;
  const scope = 'identify guilds';
  
  const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri!)}&response_type=code&scope=${encodeURIComponent(scope)}`;
  res.redirect(url);
});

// OAuth2 callback route
router.get('/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect('/?error=no_code');
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token } = tokenResponse.data;

    // Get user info
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    // Get user's guilds
    const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    // Create JWT token
    const token = jwt.sign(
      {
        id: userResponse.data.id,
        username: userResponse.data.username,
        discriminator: userResponse.data.discriminator,
        avatar: userResponse.data.avatar,
        access_token,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set JWT token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to dashboard
    res.redirect('/dashboard');
  } catch (error) {
    console.error('OAuth2 error:', error);
    res.redirect('/?error=auth_failed');
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    res.json(decoded);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

export default router; 