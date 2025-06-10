import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LeaderboardEntry {
  userId: string;
  username: string;
  level: number;
  balance: number;
}

interface LeaderboardResponse {
  entries: LeaderboardEntry[];
}

const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<LeaderboardResponse>('/api/leaderboard', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setEntries(response.data.entries);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        navigate('/login');
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, navigate]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <ul className="space-y-4">
          {entries.map((entry) => (
            <li key={entry.userId} className="flex items-center justify-between border-b pb-2">
              <div>
                <span className="font-semibold">{entry.username}</span>
              </div>
              <div className="text-right">
                <div>Level: {entry.level}</div>
                <div>Balance: {entry.balance}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Leaderboard; 