import express from 'express';
import Stripe from 'stripe';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Create a checkout session
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { priceId } = req.body;
    const userId = req.user.id;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/premium`,
      customer_email: req.user.email,
      metadata: {
        userId,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Handle Stripe webhook events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send('Webhook signature verification failed');
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (!userId) {
          throw new Error('No user ID in session metadata');
        }

        // Update user's premium status in database
        // TODO: Implement database update
        console.log(`User ${userId} subscribed to premium`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          throw new Error('No user ID in subscription metadata');
        }

        // Update user's premium status in database
        // TODO: Implement database update
        console.log(`User ${userId} cancelled premium subscription`);
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Get subscription status
router.get('/subscription', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // TODO: Get subscription status from database
    const hasActiveSubscription = false;

    res.json({ hasActiveSubscription });
  } catch (error) {
    console.error('Failed to get subscription status:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

export default router;