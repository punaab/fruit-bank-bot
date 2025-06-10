import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, GuildMember } from 'discord.js';
import { User } from '../models/User';
import { logger } from '../../utils/logger';

const MARKET_ITEMS = [
  { name: 'Apple', basePrice: 10 },
  { name: 'Banana', basePrice: 15 },
  { name: 'Orange', basePrice: 20 },
  { name: 'Strawberry', basePrice: 25 },
  { name: 'Watermelon', basePrice: 30 }
];

export const data = new SlashCommandBuilder()
  .setName('market')
  .setDescription('View and update market prices')
  .addSubcommand(subcommand =>
    subcommand
      .setName('view')
      .setDescription('View current market prices')
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('update')
      .setDescription('Update market prices (Admin only)')
      .addStringOption(option =>
        option.setName('item')
          .setDescription('The item to update')
          .setRequired(true)
          .addChoices(...MARKET_ITEMS.map(item => ({ name: item.name, value: item.name })))
      )
      .addIntegerOption(option =>
        option.setName('price')
          .setDescription('The new price')
          .setRequired(true)
          .setMinValue(1)
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'view') {
      // Create market prices embed
      const embed = new EmbedBuilder()
        .setColor('#FF6B6B')
        .setTitle('🏪 Fruit Market')
        .setDescription('Current market prices:')
        .addFields(
          MARKET_ITEMS.map(item => ({
            name: item.name,
            value: `${item.basePrice} coins`,
            inline: true
          }))
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } else if (subcommand === 'update') {
      // Check if user has admin permissions
      const member = interaction.member as GuildMember;
      if (!member?.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({
          content: 'You need administrator permissions to update market prices!',
          ephemeral: true
        });
      }

      const itemName = interaction.options.getString('item', true);
      const newPrice = interaction.options.getInteger('price', true);

      // Find and update the item
      const item = MARKET_ITEMS.find(i => i.name === itemName);
      if (!item) {
        return interaction.reply({
          content: 'Invalid item!',
          ephemeral: true
        });
      }

      item.basePrice = newPrice;

      const embed = new EmbedBuilder()
        .setColor('#4CAF50')
        .setTitle('✅ Market Updated')
        .setDescription(`Updated ${itemName} price to ${newPrice} coins`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }

  } catch (error) {
    logger.error('Error in market command:', error);
    await interaction.reply({
      content: 'There was an error while managing the market!',
      ephemeral: true
    });
  }
} 