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
      <h1 className="text-2xl font-bold">Server Leaderboard</h1>
      <input
        type="text"
        placeholder="Enter Guild ID"
        value={guildId}
        onChange={(e) => setGuildId(e.target.value)}
        className="border p-2 mt-4"
      />
      <ul>
        {entries.map((entry) => (
          <li key={entry.userId}>
            User: {entry.username} - Level: {entry.level} - Balance: {entry.balance}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard; 