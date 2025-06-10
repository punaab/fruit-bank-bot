import mongoose, { Schema, Document } from 'mongoose';
import { UserData } from '../types';

export interface IUser extends UserData, Document {}

const UserSchema = new Schema<IUser>({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  balance: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
  inventory: {
    type: Map,
    of: Number,
    default: new Map()
  },
  lastPick: { type: Date, default: new Date(0) },
  lastSteal: { type: Date, default: new Date(0) }
});

// Create compound index for userId and guildId
UserSchema.index({ userId: 1, guildId: 1 }, { unique: true });

export const User = mongoose.model<IUser>('User', UserSchema); 