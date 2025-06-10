import express from 'express';
// import { authenticateToken } from '../middleware/auth';
// import { apiLimiter } from '../middleware/rateLimit';
import Stripe from 'stripe';
import Server from '../../bot/models/Server.js';
import { Webhook, MessageBuilder } from 'discord-webhook-node';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil'
});

const hook = new Webhook(process.env.DISCORD_WEBHOOK_URL || '');

// Create checkout session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { guildId } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Premium Server Upgrade',
              description: 'Upgrade your server to premium status'
            },
            unit_amount: 999 // $9.99
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: {
        guildId
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Handle webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const guildId = session.metadata?.guildId;

      if (guildId) {
        // Update server status in database
        await Server.findOneAndUpdate(
          { guildId },
          { isPremium: true },
          { upsert: true }
        );

        // Send Discord notification
        const embed = new MessageBuilder()
          .setTitle('Premium Purchase')
          .setDescription(`Server ${guildId} has been upgraded to premium!`)
          .setColor('#00ff00');

        await hook.send(embed);
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

export default router;