import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { User } from '../models/User';
import { logger } from '../../utils/logger';

export const data = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('View the top players')
  .addStringOption(option =>
    option.setName('category')
      .setDescription('The leaderboard category to view')
      .setRequired(true)
      .addChoices(
        { name: 'Balance', value: 'balance' },
        { name: 'Level', value: 'level' },
        { name: 'Experience', value: 'experience' }
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    const category = interaction.options.getString('category', true);
    
    // Get top users based on category
    const users = await User.find({ guildId: interaction.guildId! })
      .sort({ [category]: -1 })
      .limit(10);

    if (users.length === 0) {
      return interaction.reply({
        content: 'No users found on the leaderboard!',
        ephemeral: true
      });
    }

    // Create leaderboard embed
    const embed = new EmbedBuilder()
      .setColor('#FF6B6B')
      .setTitle(`🏆 ${category.charAt(0).toUpperCase() + category.slice(1)} Leaderboard`)
      .setDescription(
        users.map((user: any, index: number) => {
          const value = category === 'balance' 
            ? `${user.balance} coins`
            : category === 'level'
              ? `Level ${user.level}`
              : `${user.experience} XP`;
          return `${index + 1}. <@${user.userId}> - ${value}`;
        }).join('\n')
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

  } catch (error) {
    logger.error('Error in leaderboard command:', error);
    await interaction.reply({
      content: 'There was an error while fetching the leaderboard!',
      ephemeral: true
    });
  }
} 