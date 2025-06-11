import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const clientId = process.env.CLIENT_ID;
  const redirectUri = encodeURIComponent('https://fruitbank.xyz/auth/callback');
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=268504064&scope=bot%20applications.commands%20guilds&redirect_uri=${redirectUri}`;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">Fruit Bank Bot</h1>
          <p className="text-xl mb-8">The most fun fruit-picking economy bot for Discord!</p>
          <a
            href={discordAuthUrl}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
          >
            Add to Discord
          </a>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">🍎 Pick Fruits</h3>
            <p>Collect different fruits and build your inventory</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">💰 Earn Coins</h3>
            <p>Sell fruits and earn coins to buy upgrades</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">🏆 Compete</h3>
            <p>Compete with friends on the leaderboard</p>
          </div>
        </div>

        {/* Premium Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Premium Features</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-2">🌟 Premium</h3>
              <p className="mb-4">$4.99/month</p>
              <ul className="text-left mb-4">
                <li>• Double fruit spawn rates</li>
                <li>• Exclusive fruit types</li>
                <li>• Custom role colors</li>
              </ul>
              <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Subscribe
              </button>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-2">💎 Elite</h3>
              <p className="mb-4">$9.99/month</p>
              <ul className="text-left mb-4">
                <li>• All Premium features</li>
                <li>• Custom server events</li>
                <li>• Priority support</li>
              </ul>
              <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 