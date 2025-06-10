import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { User } from '../models/User';
import { logger } from '../../utils/logger';

export const data = new SlashCommandBuilder()
  .setName('inventory')
  .setDescription('View your inventory');

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    // Get user data
    const user = await User.findOne({
      userId: interaction.user.id,
      guildId: interaction.guildId!
    });

    if (!user) {
      return interaction.reply({
        content: 'You need to start playing first! Use `/pick` to begin.',
        ephemeral: true
      });
    }

    // Create inventory embed
    const inventoryEntries = Array.from(user.inventory.entries()) as [string, number][];
    const embed = new EmbedBuilder()
      .setColor('#FF6B6B')
      .setTitle(`${interaction.user.username}'s Inventory`)
      .setDescription('Your collected fruits:')
      .addFields(
        inventoryEntries
          .filter((entry) => {
            const [, amount] = entry;
            return amount > 0;
          })
          .map((entry) => {
            const [item, amount] = entry;
            return {
              name: item,
              value: `Amount: ${amount}`,
              inline: true
            };
          })
      )
      .setTimestamp();

    if (user.inventory.size === 0) {
      embed.setDescription('Your inventory is empty! Use `/pick` to collect some fruits.');
    }

    await interaction.reply({ embeds: [embed] });

  } catch (error) {
    logger.error('Error in inventory command:', error);
    await interaction.reply({
      content: 'There was an error while fetching your inventory!',
      ephemeral: true
    });
  }
} 