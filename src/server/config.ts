interface Config {
  stripe: {
    secretKey: string;
    webhookSecret: string;
  };
  clientUrl: string;
}

export const config: Config = {
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ''
  },
  clientUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
}; 