import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import { config } from 'dotenv';
import { connect } from 'mongoose';
import { logger } from '../utils/logger';
import { CommandsCollection } from './types';

// Load environment variables
config();

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Create commands collection
export const commands: CommandsCollection = new Collection();

// Load commands
const loadCommands = async () => {
  try {
    const commandFiles = [
      './commands/pick',
      './commands/inventory',
      './commands/sell',
      './commands/shop',
      './commands/market',
      './commands/quest',
      './commands/leaderboard',
      './commands/profile',
      './commands/role',
      './commands/steal'
    ];

    for (const file of commandFiles) {
      const command = await import(file);
      if ('data' in command && 'execute' in command) {
        commands.set(command.data.name, command);
        logger.info(`Loaded command: ${command.data.name}`);
      } else {
        logger.warn(`Command at ${file} is missing required properties`);
      }
    }
  } catch (error) {
    logger.error('Error loading commands:', error);
  }
};

// Load events
const loadEvents = async () => {
  try {
    const eventFiles = ['./events/ready', './events/interactionCreate'];

    for (const file of eventFiles) {
      const event = await import(file);
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
      } else {
        client.on(event.name, (...args) => event.execute(...args));
      }
      logger.info(`Loaded event: ${event.name}`);
    }
  } catch (error) {
    logger.error('Error loading events:', error);
  }
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_PUBLIC_URL;
    if (!mongoUri) {
      throw new Error('MONGO_PUBLIC_URL is not defined in environment variables');
    }

    await connect(mongoUri);
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Initialize bot
const init = async () => {
  try {
    await connectDB();
    await loadCommands();
    await loadEvents();

    const token = process.env.DISCORD_TOKEN;
    if (!token) {
      throw new Error('DISCORD_TOKEN is not defined in environment variables');
    }

    await client.login(token);
  } catch (error) {
    logger.error('Error initializing bot:', error);
    process.exit(1);
  }
};

// Start bot
init(); 