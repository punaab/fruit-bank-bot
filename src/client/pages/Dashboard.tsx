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

interface ShopItem {
  name: string;
  price: number;
  type: string;
  effect: string;
}

interface Server {
  id: string;
  name: string;
  icon: string;
  shopItems: ShopItem[];
  premium: boolean;
}

interface DashboardResponse {
  items: Item[];
  rewards: Reward[];
  server: Server;
}

interface CheckoutResponse {
  url: string;
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

  const handleShopUpdate = async (items: ShopItem[]) => {
    if (!server) return;
    await axios.put(`/api/dashboard/${server.id}/shop`, { items });
    alert('Shop updated!');
  };

  const handleCheckout = async () => {
    if (!server) return;
    const response = await axios.post<CheckoutResponse>('/api/stripe/create-checkout-session', { 
      guildId: server.id 
    });
    window.location.href = response.data.url;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Fruit Bank Dashboard</h1>
      {server && (
        <>
          <div className="mt-4">
            <h2 className="text-xl font-semibold">Shop Items</h2>
            <ul className="mt-2">
              {server.shopItems.map((item: ShopItem) => (
                <li key={item.name} className="flex items-center justify-between py-2">
                  <span>{item.name}</span>
                  <span>{item.price} coins</span>
                </li>
              ))}
            </ul>
          </div>
          {!server.premium && (
            <button
              onClick={handleCheckout}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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