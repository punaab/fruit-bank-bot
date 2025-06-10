import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Item {
  name: string;
  quantity: number;
}

interface Reward {
  name: string;
  cost: number;
}

interface Server {
  id: string;
  name: string;
  icon: string;
}

interface DashboardResponse {
  items: Item[];
  rewards: Reward[];
  server: Server;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [server, setServer] = useState<Server | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<DashboardResponse>('/api/dashboard', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setServer(response.data.server);
        setItems(response.data.items);
        setRewards(response.data.rewards);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        navigate('/login');
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, navigate]);

  const handleShopUpdate = async (items: any) => {
    await axios.put(`/api/dashboard/${server?.id}/shop`, { items });
    alert('Shop updated!');
  };

  const handleCheckout = async () => {
    const res = await axios.post('/api/stripe/create-checkout-session', { guildId: server?.id });
    window.location.href = res.data.url;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Fruit Bank Dashboard</h1>
      {server && (
        <>
          <h2>Shop Items</h2>
          <ul>
            {server.shopItems.map((item) => (
              <li key={item.name}>{item.name} - ${item.price}</li>
            ))}
          </ul>
          <button
            onClick={() => handleShopUpdate(server.shopItems)}
            className="bg-blue-500 text-white p-2 mt-4"
          >
            Update Shop
          </button>
          {!server.premium && (
            <button
              onClick={handleCheckout}
              className="bg-green-500 text-white p-2 mt-4"
            >
              Upgrade to Premium
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard; 