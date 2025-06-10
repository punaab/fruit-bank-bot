import mongoose from 'mongoose';

const serverSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true,
  },
  shopItems: [{
    name: String,
    price: Number,
    description: String,
  }],
  users: [{
    userId: String,
    balance: Number,
    inventory: [{
      itemId: String,
      quantity: Number,
    }],
  }],
  settings: {
    currencyName: {
      type: String,
      default: 'coins',
    },
    prefix: {
      type: String,
      default: '!',
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
  },
}, {
  timestamps: true,
});

const Server = mongoose.model('Server', serverSchema);

export default Server; 