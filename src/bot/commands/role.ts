import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, GuildMember } from 'discord.js';
import { User } from '../models/User';
import { logger } from '../../utils/logger';

const ROLE_REQUIREMENTS = {
  'Fruit Farmer': { level: 5, balance: 1000 },
  'Fruit Master': { level: 10, balance: 5000 },
  'Fruit Legend': { level: 20, balance: 20000 }
};

export const data = new SlashCommandBuilder()
  .setName('role')
  .setDescription('Manage user roles')
  .addUserOption(option =>
    option.setName('user')
      .setDescription('The user to manage roles for')
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    const targetUser = interaction.options.getUser('user', true);
    const member = interaction.guild?.members.cache.get(targetUser.id);

    if (!member) {
      return interaction.reply({
        content: 'User not found in this server!',
        ephemeral: true
      });
    }

    // Create role management embed
    const embed = new EmbedBuilder()
      .setColor('#FF6B6B')
      .setTitle(`Role Management - ${targetUser.username}`)
      .setDescription('Current roles:')
      .addFields(
        member.roles.cache
          .filter(role => role.name !== '@everyone')
          .map(role => ({
            name: role.name,
            value: `ID: ${role.id}`,
            inline: true
          }))
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

  } catch (error) {
    logger.error('Error in role command:', error);
    await interaction.reply({
      content: 'There was an error while managing roles!',
      ephemeral: true
    });
  }
} 