import express from 'express';
// import { authenticateToken } from '../middleware/auth';
// import { apiLimiter } from '../middleware/rateLimit';
import Stripe from 'stripe';
import Server from '../../bot/models/Server.js';
import { WebhookClient } from '@vermaysha/discord-webhook';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil'
});

const discordWebhook = new WebhookClient(process.env.DISCORD_WEBHOOK_URL || '');

// Create checkout session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { priceId, guildId } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: {
        guildId,
      },
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send(`Error: ${error.message}`);
    } else {
      res.status(400).send('An unknown error occurred');
    }
  }
});

// Handle webhook events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig || '',
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const guildId = session.metadata?.guildId;

      if (guildId) {
        const server = await Server.findOne({ guildId });
        if (server && server.settings) {
          // Update server with premium status
          server.settings.isPremium = true;
          await server.save();

          // Send Discord notification
          const embed = new WebhookClient(process.env.DISCORD_WEBHOOK_URL || '')
            .addEmbed(new WebhookClient.Embed()
              .setTitle('Premium Purchase')
              .setDescription(`Server ${guildId} has been upgraded to premium!`)
              .setColor('#00ff00')
            );
          await discordWebhook.send();
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send(`Webhook Error: ${error.message}`);
    } else {
      res.status(400).send('An unknown error occurred');
    }
  }
});

export default router;