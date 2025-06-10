import { Schema, model, Document } from 'mongoose';

interface IQuest extends Document {
  guildId: string;
  quests: {
    id: string;
    title: string;
    description: string;
    requirements: {
      type: string;
      amount: number;
    }[];
    rewards: {
      type: string;
      amount: number;
    }[];
    active: boolean;
    startDate: Date;
    endDate: Date;
  }[];
}

const questSchema = new Schema<IQuest>({
  guildId: { type: String, required: true, unique: true },
  quests: [{
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: [{
      type: { type: String, required: true },
      amount: { type: Number, required: true }
    }],
    rewards: [{
      type: { type: String, required: true },
      amount: { type: Number, required: true }
    }],
    active: { type: Boolean, default: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true }
  }]
});

export const Quest = model<IQuest>('Quest', questSchema); 