import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
}

interface Guild {
  id: string;
  name: string;
  icon: string;
  owner: boolean;
  permissions: string;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get<User>('/api/auth/me');
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        navigate('/');
      }
    };

    const fetchGuilds = async () => {
      try {
        const response = await axios.get<Guild[]>('/api/auth/guilds');
        setGuilds(response.data);
      } catch (error) {
        console.error('Failed to fetch guilds:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchGuilds();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      navigate('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {user?.avatar && (
                <img
                  src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                  alt={user.username}
                  className="h-10 w-10 rounded-full"
                />
              )}
              <div>
                <h1 className="text-xl font-bold">{user?.username}</h1>
                <p className="text-gray-400">#{user?.discriminator}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Server Management */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Your Servers</h2>
            <div className="space-y-4">
              {guilds.map((guild) => (
                <div
                  key={guild.id}
                  className="flex items-center space-x-4 bg-gray-700 p-4 rounded"
                >
                  {guild.icon ? (
                    <img
                      src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                      alt={guild.name}
                      className="h-12 w-12 rounded"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded bg-gray-600 flex items-center justify-center">
                      {guild.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{guild.name}</h3>
                    <p className="text-sm text-gray-400">
                      {guild.owner ? 'Owner' : 'Member'}
                    </p>
                  </div>
                  <button
                    className="ml-auto px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    onClick={() => navigate(`/dashboard/server/${guild.id}`)}
                  >
                    Manage
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Features */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Premium Features</h2>
            <div className="space-y-6">
              <div className="bg-gray-700 p-6 rounded">
                <h3 className="text-xl font-semibold mb-2">Premium Subscription</h3>
                <p className="text-gray-400 mb-4">
                  Unlock all premium features and support the bot's development
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Unlimited fruit picking
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Advanced statistics
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Custom fruit types
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Priority support
                  </li>
                </ul>
                <button
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                  onClick={() => navigate('/premium')}
                >
                  Subscribe Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 