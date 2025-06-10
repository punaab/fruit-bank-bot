---
title: Discord Bot Typescript
description: A Discord bot written in Typescript
tags:
  - discord.js
  - typescript
  - javascript
---

# Fruit Bank Bot

A Discord bot for managing a fruit-themed economy with various commands for collecting, trading, and managing fruits.

## Features

- 🍎 Fruit Collection: Pick fruits with the `/pick` command
- 💰 Economy System: Buy, sell, and trade fruits
- 📊 Experience & Leveling: Gain experience and level up
- 🏆 Role-based Progression: Earn roles based on achievements
- 📜 Quest System: Complete quests for rewards
- 📈 Market: View and update market prices
- 🎯 Stealing: Try to steal fruits from other users
- 📊 Leaderboards: View top players in various categories
- 👤 Profiles: View your or other users' profiles

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fruit-bank-bot.git
cd fruit-bank-bot
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:
```env
# Discord Bot Token
DISCORD_TOKEN=your_discord_bot_token_here

# MongoDB Connection URI
MONGODB_URI=mongodb://localhost:27017/fruit-bank

# Logging Level (debug, info, warn, error)
LOG_LEVEL=info
```

4. Build the project:
```bash
npm run build
```

5. Start the bot:
```bash
npm start
```

## Commands

- `/pick` - Pick a fruit from the tree
- `/inventory` - View your inventory
- `/sell` - Sell your fruits
- `/shop` - View and buy items from the shop
- `/market` - View and update market prices
- `/quest` - Manage and view quests
- `/leaderboard` - View the top players
- `/profile` - View your or another user's profile
- `/role` - Check and claim roles
- `/steal` - Try to steal fruits from another user

## Development

- `npm run build` - Build the project
- `npm run dev` - Run the bot in development mode with hot reload
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💁‍♀️ How to use

- Install dependencies `npm`
- Connect to your Railway project `railway link`
- Start the bot `railway run npm start`

## 📝 Notes

- To create a new command, just create a file in the `Commands` directory. You can take a look at the `Template.js` file for an example of what commands should look like. For any additional help see the [discord.js guide](https://discordjs.guide).
- If you need any additional help with this, join our [Discord server](https://discord.gg/railway) and create a thread in the project help channel.