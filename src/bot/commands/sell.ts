import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { User } from '../models/User';
import { logger } from '../../utils/logger';

interface MarketItem {
  name: string;
  basePrice: number;
}

const MARKET_ITEMS: MarketItem[] = [
  { name: 'Apple', basePrice: 10 },
  { name: 'Banana', basePrice: 15 },
  { name: 'Orange', basePrice: 20 },
  { name: 'Strawberry', basePrice: 25 },
  { name: 'Watermelon', basePrice: 30 }
];

export const data = new SlashCommandBuilder()
  .setName('sell')
  .setDescription('Sell your fruits')
  .addStringOption(option =>
    option.setName('item')
      .setDescription('The item to sell')
      .setRequired(true)
      .addChoices(...MARKET_ITEMS.map(item => ({ name: item.name, value: item.name })))
  )
  .addIntegerOption(option =>
    option.setName('amount')
      .setDescription('Amount to sell (default: 1)')
      .setRequired(false)
      .setMinValue(1)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    const itemName = interaction.options.getString('item', true);
    const amount = interaction.options.getInteger('amount') || 1;

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

    // Check if user has enough items
    const userAmount = user.inventory.get(itemName) || 0;
    if (userAmount < amount) {
      return interaction.reply({
        content: `You don't have enough ${itemName}! You only have ${userAmount}.`,
        ephemeral: true
      });
    }

    // Calculate sell price
    const item = MARKET_ITEMS.find(i => i.name === itemName);
    if (!item) {
      return interaction.reply({
        content: 'Invalid item!',
        ephemeral: true
      });
    }

    const totalPrice = item.basePrice * amount;

    // Update user data
    user.inventory.set(itemName, userAmount - amount);
    user.balance += totalPrice;

    // Add experience
    user.experience += amount * 5;
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
      .setTitle('💰 Sale Complete!')
      .setDescription(`You sold ${amount}x ${itemName} for ${totalPrice} coins!`)
      .addFields(
        { name: 'New Balance', value: `${user.balance} coins`, inline: true }
      )
      .setTimestamp();

    if (levelUp) {
      embed.addFields({ name: '🎉 Level Up!', value: `You are now level ${user.level}!` });
    }

    await interaction.reply({ embeds: [embed] });

  } catch (error) {
    logger.error('Error in sell command:', error);
    await interaction.reply({
      content: 'There was an error while selling your items!',
      ephemeral: true
    });
  }
} 