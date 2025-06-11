import {
    Client,
    Events,
    GatewayIntentBits,
    Partials,
    REST,
    Routes
} from "discord.js";
import { config } from 'dotenv';
import { logger } from './utils/logger';

// Load environment variables
config();

const token = process.env.DISCORD_TOKEN;
const client_id = process.env.CLIENT_ID;

// Debug logging
logger.info('Token length: ' + (token ? token.length : 0));
logger.info('Token starts with: ' + (token ? token.substring(0, 5) + '...' : 'undefined'));

if (!token || !client_id) {
  logger.error('Missing required environment variables');
  process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel],
});

// Register slash commands
const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    logger.info('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(client_id),
      {
        body: [
          {
            name: 'pick',
            description: 'Pick a fruit from the tree',
          },
          {
            name: 'inventory',
            description: 'View your fruit inventory',
          },
          {
            name: 'sell',
            description: 'Sell your fruits',
          },
          {
            name: 'shop',
            description: 'View the shop',
          },
          {
            name: 'buy',
            description: 'Buy items from the shop',
          },
          {
            name: 'leaderboard',
            description: 'View the server leaderboard',
          },
          {
            name: 'help',
            description: 'Get help with commands',
          },
        ],
      },
    );

    logger.info('Successfully reloaded application (/) commands.');
  } catch (error) {
    logger.error('Error refreshing application commands:', error);
  }
})();

// Handle ready event
client.once(Events.ClientReady, (c) => {
  logger.info(`Logged in as ${c.user.tag}!`);
});

// Handle interaction events
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  try {
    switch (commandName) {
      case 'pick':
        // Handle pick command
        await interaction.reply('You picked a fruit!');
        break;
      case 'inventory':
        // Handle inventory command
        await interaction.reply('Your inventory is empty!');
        break;
      case 'sell':
        // Handle sell command
        await interaction.reply('You sold your fruits!');
        break;
      case 'shop':
        // Handle shop command
        await interaction.reply('Welcome to the shop!');
        break;
      case 'buy':
        // Handle buy command
        await interaction.reply('You bought an item!');
        break;
      case 'leaderboard':
        // Handle leaderboard command
        await interaction.reply('Here is the leaderboard!');
        break;
      case 'help':
        // Handle help command
        await interaction.reply('Here are the available commands!');
        break;
      default:
        await interaction.reply('Unknown command!');
    }
  } catch (error) {
    logger.error('Error handling command:', error);
    await interaction.reply('There was an error executing the command!');
  }
});

// Login to Discord
client.login(token);