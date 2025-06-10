import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { User } from '../models/User';
import { logger } from '../../utils/logger';

const PICK_COOLDOWN = 300000; // 5 minutes in milliseconds
const FRUITS = ['Apple', 'Banana', 'Orange', 'Strawberry', 'Watermelon'];
const FRUIT_CHANCES = {
  'Apple': 0.4,    // 40%
  'Banana': 0.3,   // 30%
  'Orange': 0.15,  // 15%
  'Strawberry': 0.1, // 10%
  'Watermelon': 0.05 // 5%
};

export const data = new SlashCommandBuilder()
  .setName('pick')
  .setDescription('Pick a fruit from the tree');

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    // Get user data
    const user = await User.findOne({
      userId: interaction.user.id,
      guildId: interaction.guildId!
    });

    if (!user) {
      // Create new user
      const newUser = await User.create({
        userId: interaction.user.id,
        guildId: interaction.guildId!,
        balance: 0,
        level: 1,
        experience: 0,
        inventory: new Map(),
        lastPick: new Date(0),
        lastSteal: new Date(0)
      });

      // First pick is free
      const fruit = getRandomFruit();
      newUser.inventory.set(fruit, 1);
      newUser.lastPick = new Date();
      await newUser.save();

      const embed = new EmbedBuilder()
        .setColor('#4CAF50')
        .setTitle('🎉 Welcome to Fruit Bank!')
        .setDescription(`You picked your first fruit: ${fruit}!`)
        .addFields(
          { name: 'Next Pick', value: 'Available now!' }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
      return;
    }

    // Check cooldown
    const timeLeft = PICK_COOLDOWN - (Date.now() - user.lastPick.getTime());

    if (timeLeft > 0) {
      const minutes = Math.ceil(timeLeft / 60000);
      return interaction.reply({
        content: `You need to wait ${minutes} minutes before picking again!`,
        ephemeral: true
      });
    }

    // Pick fruit
    const fruit = getRandomFruit();
    const currentAmount = user.inventory.get(fruit) || 0;
    user.inventory.set(fruit, currentAmount + 1);
    user.lastPick = new Date();

    // Add experience
    user.experience += 10;
    const nextLevelXp = Math.floor(100 * Math.pow(1.5, user.level));
    let levelUp = false;

    if (user.experience >= nextLevelXp) {
      user.level += 1;
      user.experience -= nextLevelXp;
      levelUp = true;
    }

    await user.save();

    const embed = new EmbedBuilder()
      .setColor('#4CAF50')
      .setTitle('🍎 Fruit Picked!')
      .setDescription(`You picked a ${fruit}!`)
      .addFields(
        { name: 'Next Pick', value: 'Available in 5 minutes' }
      )
      .setTimestamp();

    if (levelUp) {
      embed.addFields({ name: '🎉 Level Up!', value: `You are now level ${user.level}!` });
    }

    await interaction.reply({ embeds: [embed] });

  } catch (error) {
    logger.error('Error in pick command:', error);
    await interaction.reply({
      content: 'There was an error while picking fruits!',
      ephemeral: true
    });
  }
}

function getRandomFruit(): string {
  const rand = Math.random();
  let cumulative = 0;

  for (const [fruit, chance] of Object.entries(FRUIT_CHANCES)) {
    cumulative += chance;
    if (rand <= cumulative) {
      return fruit;
    }
  }

  return FRUITS[0]; // Fallback to first fruit
} 