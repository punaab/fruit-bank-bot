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
  .addSubcommand(subcommand =>
    subcommand
      .setName('check')
      .setDescription('Check available roles and requirements')
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('claim')
      .setDescription('Claim a role if you meet the requirements')
      .addStringOption(option =>
        option.setName('role')
          .setDescription('The role to claim')
          .setRequired(true)
          .addChoices(
            { name: 'Fruit Farmer', value: 'Fruit Farmer' },
            { name: 'Fruit Master', value: 'Fruit Master' },
            { name: 'Fruit Legend', value: 'Fruit Legend' }
          )
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'check') {
      // Create role requirements embed
      const embed = new EmbedBuilder()
        .setColor('#FF6B6B')
        .setTitle('🎭 Available Roles')
        .setDescription('Here are the roles you can earn:')
        .addFields(
          Object.entries(ROLE_REQUIREMENTS).map(([role, req]) => ({
            name: role,
            value: `Level ${req.level}\n${req.balance} coins`
          }))
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } else if (subcommand === 'claim') {
      const roleName = interaction.options.getString('role', true);
      const requirements = ROLE_REQUIREMENTS[roleName as keyof typeof ROLE_REQUIREMENTS];

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

      // Check requirements
      if (user.level < requirements.level || user.balance < requirements.balance) {
        return interaction.reply({
          content: `You don't meet the requirements for ${roleName}!\n` +
            `You need to be level ${requirements.level} and have ${requirements.balance} coins.`,
          ephemeral: true
        });
      }

      // Get role
      const role = interaction.guild?.roles.cache.find(r => r.name === roleName);
      if (!role) {
        return interaction.reply({
          content: 'Role not found! Please contact an administrator.',
          ephemeral: true
        });
      }

      // Add role
      try {
        const member = interaction.member as GuildMember;
        if (!member) {
          return interaction.reply({
            content: 'Could not find your member data!',
            ephemeral: true
          });
        }

        await member.roles.add(role);
        await interaction.reply({
          content: `Congratulations! You've earned the ${roleName} role!`,
          ephemeral: false
        });
      } catch (error) {
        logger.error('Error adding role:', error);
        await interaction.reply({
          content: 'There was an error while adding the role. Please contact an administrator.',
          ephemeral: true
        });
      }
    }

  } catch (error) {
    logger.error('Error in role command:', error);
    await interaction.reply({
      content: 'There was an error while managing roles!',
      ephemeral: true
    });
  }
} 