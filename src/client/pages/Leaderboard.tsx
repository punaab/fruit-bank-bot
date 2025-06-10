import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  userId: string;
  coins: number;
  inventory: { fruit: string; quantity: number }[];
  role: string;
  roleLevel: number;
}

const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [guildId, setGuildId] = useState<string>('');

  useEffect(() => {
    if (guildId) {
      axios.get(`/api/leaderboard/${guildId}`).then((res) => setUsers(res.data));
    }
  }, [guildId]);

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
        {users.map((user) => (
          <li key={user.userId}>
            User: {user.userId} - Coins: {user.coins} - Role: {user.role} (Level{' '}
            {user.roleLevel})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard; 