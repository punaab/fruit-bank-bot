import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { User } from '../models/User';
import { logger } from '../../utils/logger';

export const data = new SlashCommandBuilder()
  .setName('profile')
  .setDescription('View your or another user\'s profile')
  .addUserOption(option =>
    option.setName('user')
      .setDescription('The user to view the profile of')
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    
    // Get user data
    const user = await User.findOne({
      userId: targetUser.id,
      guildId: interaction.guildId!
    });

    if (!user) {
      return interaction.reply({
        content: `${targetUser.username} hasn't started playing yet!`,
        ephemeral: true
      });
    }

    // Calculate next level XP
    const nextLevelXp = Math.floor(100 * Math.pow(1.5, user.level));
    const progress = (user.experience / nextLevelXp) * 100;

    // Create profile embed
    const embed = new EmbedBuilder()
      .setColor('#FF6B6B')
      .setTitle(`${targetUser.username}'s Profile`)
      .setThumbnail(targetUser.displayAvatarURL())
      .addFields(
        { name: 'Level', value: user.level.toString(), inline: true },
        { name: 'Experience', value: `${user.experience}/${nextLevelXp} (${progress.toFixed(1)}%)`, inline: true },
        { name: 'Balance', value: `${user.balance} coins`, inline: true },
        { 
          name: 'Inventory', 
          value: Array.from(user.inventory.entries())
            .filter(([_, amount]) => amount > 0)
            .map(([item, amount]) => `${item}: ${amount}`)
            .join('\n') || 'Empty'
        }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

  } catch (error) {
    logger.error('Error in profile command:', error);
    await interaction.reply({
      content: 'There was an error while fetching the profile!',
      ephemeral: true
    });
  }
} 