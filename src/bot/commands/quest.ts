import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, GuildMember } from 'discord.js';
import { User } from '../models/User';
import { logger } from '../../utils/logger';

interface Quest {
  id: string;
  title: string;
  description: string;
  requirements: { item: string; amount: number }[];
  rewards: { type: 'coins' | 'experience'; amount: number }[];
  createdBy: string;
  createdAt: Date;
}

const ACTIVE_QUESTS: Quest[] = [];

export const data = new SlashCommandBuilder()
  .setName('quest')
  .setDescription('Manage and view quests')
  .addSubcommand(subcommand =>
    subcommand
      .setName('list')
      .setDescription('View available quests')
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('create')
      .setDescription('Create a new quest (Admin only)')
      .addStringOption(option =>
        option.setName('title')
          .setDescription('The quest title')
          .setRequired(true)
      )
      .addStringOption(option =>
        option.setName('description')
          .setDescription('The quest description')
          .setRequired(true)
      )
      .addStringOption(option =>
        option.setName('requirements')
          .setDescription('Required items (format: item:amount,item:amount)')
          .setRequired(true)
      )
      .addStringOption(option =>
        option.setName('rewards')
          .setDescription('Rewards (format: type:amount,type:amount)')
          .setRequired(true)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('complete')
      .setDescription('Complete a quest')
      .addStringOption(option =>
        option.setName('quest_id')
          .setDescription('The ID of the quest to complete')
          .setRequired(true)
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'list') {
      if (ACTIVE_QUESTS.length === 0) {
        return interaction.reply({
          content: 'There are no active quests at the moment!',
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setColor('#FF6B6B')
        .setTitle('📜 Active Quests')
        .setDescription('Here are the current quests:')
        .addFields(
          ACTIVE_QUESTS.map(quest => ({
            name: `${quest.title} (ID: ${quest.id})`,
            value: `${quest.description}\n\n` +
              `Requirements: ${quest.requirements.map(req => `${req.amount}x ${req.item}`).join(', ')}\n` +
              `Rewards: ${quest.rewards.map(rew => `${rew.amount} ${rew.type}`).join(', ')}`
          }))
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } else if (subcommand === 'create') {
      // Check if user has admin permissions
      const member = interaction.member as GuildMember;
      if (!member?.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({
          content: 'You need administrator permissions to create quests!',
          ephemeral: true
        });
      }

      const title = interaction.options.getString('title', true);
      const description = interaction.options.getString('description', true);
      const requirementsStr = interaction.options.getString('requirements', true);
      const rewardsStr = interaction.options.getString('rewards', true);

      // Parse requirements
      const requirements = requirementsStr.split(',').map(req => {
        const [item, amount] = req.split(':');
        return { item, amount: parseInt(amount) };
      });

      // Parse rewards
      const rewards = rewardsStr.split(',').map(rew => {
        const [type, amount] = rew.split(':');
        return { type: type as 'coins' | 'experience', amount: parseInt(amount) };
      });

      // Create new quest
      const quest: Quest = {
        id: Math.random().toString(36).substring(2, 8),
        title,
        description,
        requirements,
        rewards,
        createdBy: interaction.user.id,
        createdAt: new Date()
      };

      ACTIVE_QUESTS.push(quest);

      const embed = new EmbedBuilder()
        .setColor('#4CAF50')
        .setTitle('✅ Quest Created')
        .setDescription(`Quest "${title}" has been created!\nID: ${quest.id}`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } else if (subcommand === 'complete') {
      const questId = interaction.options.getString('quest_id', true);
      const quest = ACTIVE_QUESTS.find(q => q.id === questId);

      if (!quest) {
        return interaction.reply({
          content: 'Quest not found!',
          ephemeral: true
        });
      }

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

      // Check if user meets requirements
      for (const req of quest.requirements) {
        const userAmount = user.inventory.get(req.item) || 0;
        if (userAmount < req.amount) {
          return interaction.reply({
            content: `You don't have enough ${req.item}! You need ${req.amount}.`,
            ephemeral: true
          });
        }
      }

      // Remove required items
      for (const req of quest.requirements) {
        const currentAmount = user.inventory.get(req.item) || 0;
        user.inventory.set(req.item, currentAmount - req.amount);
      }

      // Give rewards
      for (const reward of quest.rewards) {
        if (reward.type === 'coins') {
          user.balance += reward.amount;
        } else {
          user.experience += reward.amount;
          // Check for level up
          const nextLevelXp = Math.floor(100 * Math.pow(1.5, user.level));
          if (user.experience >= nextLevelXp) {
            user.level += 1;
            user.experience -= nextLevelXp;
          }
        }
      }

      await user.save();

      // Remove completed quest
      const questIndex = ACTIVE_QUESTS.findIndex(q => q.id === questId);
      if (questIndex !== -1) {
        ACTIVE_QUESTS.splice(questIndex, 1);
      }

      const embed = new EmbedBuilder()
        .setColor('#4CAF50')
        .setTitle('🎉 Quest Completed!')
        .setDescription(`You have completed "${quest.title}"!\n\nRewards received:`)
        .addFields(
          quest.rewards.map(reward => ({
            name: reward.type === 'coins' ? 'Coins' : 'Experience',
            value: reward.amount.toString(),
            inline: true
          }))
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }

  } catch (error) {
    logger.error('Error in quest command:', error);
    await interaction.reply({
      content: 'There was an error while managing quests!',
      ephemeral: true
    });
  }
} 