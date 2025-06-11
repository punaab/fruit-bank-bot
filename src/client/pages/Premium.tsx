import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  interval: 'month' | 'year';
}

interface StripeResponse {
  url: string;
}

const subscriptionTiers: SubscriptionTier[] = [
  {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    price: 4.99,
    features: [
      'Unlimited fruit picking',
      'Advanced statistics',
      'Custom fruit types',
      'Priority support',
    ],
    interval: 'month',
  },
  {
    id: 'premium_yearly',
    name: 'Premium Yearly',
    price: 49.99,
    features: [
      'All monthly features',
      '2 months free',
      'Exclusive fruit types',
      'Custom server branding',
    ],
    interval: 'year',
  },
];

const Premium: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubscribe = async (tier: SubscriptionTier) => {
    setLoading(true);
    try {
      const response = await axios.post<StripeResponse>('/api/stripe/create-checkout-session', {
        priceId: tier.id,
      });
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      alert('Failed to create checkout session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Upgrade to Premium</h1>
          <p className="text-xl text-gray-400 mb-12">
            Unlock all premium features and support the bot's development
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {subscriptionTiers.map((tier) => (
            <div
              key={tier.id}
              className={`bg-gray-800 rounded-lg p-8 ${
                selectedTier?.id === tier.id ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              <h2 className="text-2xl font-bold mb-2">{tier.name}</h2>
              <p className="text-4xl font-bold mb-6">
                ${tier.price}
                <span className="text-lg text-gray-400">
                  /{tier.interval}
                </span>
              </p>
              <ul className="space-y-4 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
                  selectedTier?.id === tier.id
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                onClick={() => setSelectedTier(tier)}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>

        {selectedTier && (
          <div className="mt-12 text-center">
            <button
              className="px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              onClick={() => handleSubscribe(selectedTier)}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Subscribe Now'}
            </button>
            <button
              className="mt-4 text-gray-400 hover:text-white transition-colors"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Premium; 