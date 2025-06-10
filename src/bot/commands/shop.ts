import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { User } from '../models/User';
import { logger } from '../../utils/logger';

interface ShopItem {
  name: string;
  description: string;
  price: number;
  type: 'fruit' | 'tool' | 'special';
}

const SHOP_ITEMS: ShopItem[] = [
  { name: 'Apple Seed', description: 'Plant an apple tree', price: 50, type: 'fruit' },
  { name: 'Banana Seed', description: 'Plant a banana tree', price: 75, type: 'fruit' },
  { name: 'Orange Seed', description: 'Plant an orange tree', price: 100, type: 'fruit' },
  { name: 'Strawberry Seed', description: 'Plant a strawberry bush', price: 125, type: 'fruit' },
  { name: 'Watermelon Seed', description: 'Plant a watermelon vine', price: 150, type: 'fruit' },
  { name: 'Fertilizer', description: 'Increases fruit yield by 50%', price: 200, type: 'tool' },
  { name: 'Watering Can', description: 'Reduces pick cooldown by 1 minute', price: 300, type: 'tool' },
  { name: 'Lucky Charm', description: 'Increases rare fruit chance by 10%', price: 500, type: 'special' }
];

export const data = new SlashCommandBuilder()
  .setName('shop')
  .setDescription('View and buy items from the shop')
  .addSubcommand(subcommand =>
    subcommand
      .setName('view')
      .setDescription('View available items')
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('buy')
      .setDescription('Buy an item')
      .addStringOption(option =>
        option.setName('item')
          .setDescription('The item to buy')
          .setRequired(true)
          .addChoices(...SHOP_ITEMS.map(item => ({ name: item.name, value: item.name })))
      )
      .addIntegerOption(option =>
        option.setName('amount')
          .setDescription('Amount to buy (default: 1)')
          .setRequired(false)
          .setMinValue(1)
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'view') {
      // Create shop embed
      const embed = new EmbedBuilder()
        .setColor('#FF6B6B')
        .setTitle('🏪 Fruit Shop')
        .setDescription('Available items:')
        .addFields(
          SHOP_ITEMS.map(item => ({
            name: `${item.name} - ${item.price} coins`,
            value: `${item.description}\nType: ${item.type}`,
            inline: true
          }))
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } else if (subcommand === 'buy') {
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

      // Find item
      const item = SHOP_ITEMS.find(i => i.name === itemName);
      if (!item) {
        return interaction.reply({
          content: 'Invalid item!',
          ephemeral: true
        });
      }

      // Check if user has enough coins
      const totalCost = item.price * amount;
      if (user.balance < totalCost) {
        return interaction.reply({
          content: `You don't have enough coins! You need ${totalCost} coins.`,
          ephemeral: true
        });
      }

      // Process purchase
      user.balance -= totalCost;
      const currentAmount = user.inventory.get(itemName) || 0;
      user.inventory.set(itemName, currentAmount + amount);

      // Add experience
      user.experience += amount * 10;
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
        .setTitle('🛍️ Purchase Complete!')
        .setDescription(`You bought ${amount}x ${itemName} for ${totalCost} coins!`)
        .addFields(
          { name: 'New Balance', value: `${user.balance} coins`, inline: true }
        )
        .setTimestamp();

      if (levelUp) {
        embed.addFields({ name: '🎉 Level Up!', value: `You are now level ${user.level}!` });
      }

      await interaction.reply({ embeds: [embed] });
    }

  } catch (error) {
    logger.error('Error in shop command:', error);
    await interaction.reply({
      content: 'There was an error while accessing the shop!',
      ephemeral: true
    });
  }
} 