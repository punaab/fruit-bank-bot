import { Events, Client } from 'discord.js';
import { commands } from '../index';
import { logger } from '../../utils/logger';

export const name = Events.ClientReady;
export const once = true;

export async function execute(client: Client) {
  try {
    logger.info(`Ready! Logged in as ${client.user?.tag}`);

    // Register commands
    const commandData = Array.from(commands.values()).map(command => command.data.toJSON());
    await client.application?.commands.set(commandData);
    logger.info('Registered application commands');
  } catch (error) {
    logger.error('Error in ready event:', error);
  }
} 