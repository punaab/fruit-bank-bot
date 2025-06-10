import { Events, Interaction } from 'discord.js';
import { commands } from '../index';
import { logger } from '../../utils/logger';

export const name = Events.InteractionCreate;

export async function execute(interaction: Interaction) {
  try {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);
    if (!command) {
      logger.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      logger.error(`Error executing ${interaction.commandName}:`, error);
      const errorMessage = {
        content: 'There was an error while executing this command!',
        ephemeral: true
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    }
  } catch (error) {
    logger.error('Error in interactionCreate event:', error);
  }
} 