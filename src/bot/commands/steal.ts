import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { User } from '../models/User';
import { logger } from '../../utils/logger';

const STEAL_COOLDOWN = 3600000; // 1 hour in milliseconds
const STEAL_SUCCESS_CHANCE = 0.3; // 30% chance of success
const STEAL_PENALTY = 100; // Coins lost on failed steal

export const data = new SlashCommandBuilder()
  .setName('steal')
  .setDescription('Try to steal fruits from another user')
  .addUserOption(option =>
    option.setName('target')
      .setDescription('The user to steal from')
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    const target = interaction.options.getUser('target', true);
    
    // Prevent self-stealing
    if (target.id === interaction.user.id) {
      return interaction.reply({
        content: 'You cannot steal from yourself!',
        ephemeral: true
      });
    }

    // Get user data
    const user = await User.findOne({
      userId: interaction.user.id,
      guildId: interaction.guildId!
    });

    const targetUser = await User.findOne({
      userId: target.id,
      guildId: interaction.guildId!
    });

    if (!user || !targetUser) {
      return interaction.reply({
        content: 'Both users need to have started playing first!',
        ephemeral: true
      });
    }

    // Check cooldown
    const lastSteal = user.lastSteal?.getTime() || 0;
    const timeLeft = STEAL_COOLDOWN - (Date.now() - lastSteal);

    if (timeLeft > 0) {
      const minutes = Math.ceil(timeLeft / 60000);
      return interaction.reply({
        content: `You need to wait ${minutes} minutes before stealing again!`,
        ephemeral: true
      });
    }

    // Check if target has any fruits
    const targetFruits = Array.from(targetUser.inventory.entries())
      .filter(([_, amount]) => amount > 0);

    if (targetFruits.length === 0) {
      return interaction.reply({
        content: `${target.username} has no fruits to steal!`,
        ephemeral: true
      });
    }

    // Attempt steal
    const success = Math.random() < STEAL_SUCCESS_CHANCE;

    if (success) {
      // Select random fruit to steal
      const [fruit, amount] = targetFruits[Math.floor(Math.random() * targetFruits.length)];
      const stealAmount = Math.min(amount, Math.floor(amount * 0.3)); // Steal up to 30% of available amount

      // Update inventories
      targetUser.inventory.set(fruit, amount - stealAmount);
      const currentAmount = user.inventory.get(fruit) || 0;
      user.inventory.set(fruit, currentAmount + stealAmount);

      // Update last steal time
      user.lastSteal = new Date();

      await Promise.all([user.save(), targetUser.save()]);

      const embed = new EmbedBuilder()
        .setColor('#4CAF50')
        .setTitle('🍎 Successful Steal!')
        .setDescription(`You successfully stole ${stealAmount} ${fruit} from ${target.username}!`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } else {
      // Failed steal - pay penalty
      if (user.balance < STEAL_PENALTY) {
        return interaction.reply({
          content: `You need ${STEAL_PENALTY} coins to attempt a steal!`,
          ephemeral: true
        });
      }

      user.balance -= STEAL_PENALTY;
      user.lastSteal = new Date();
      await user.save();

      const embed = new EmbedBuilder()
        .setColor('#F44336')
        .setTitle('❌ Failed Steal!')
        .setDescription(`You were caught trying to steal from ${target.username}!\nYou lost ${STEAL_PENALTY} coins as a penalty.`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }

  } catch (error) {
    logger.error('Error in steal command:', error);
    await interaction.reply({
      content: 'There was an error while attempting to steal!',
      ephemeral: true
    });
  }
} 