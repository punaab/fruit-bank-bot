import { Schema, model, Document } from 'mongoose';

interface IMarket extends Document {
  guildId: string;
  items: {
    name: string;
    price: number;
    stock: number;
    lastUpdated: Date;
  }[];
}

const marketSchema = new Schema<IMarket>({
  guildId: { type: String, required: true, unique: true },
  items: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    lastUpdated: { type: Date, default: Date.now }
  }]
});

export const Market = model<IMarket>('Market', marketSchema); 