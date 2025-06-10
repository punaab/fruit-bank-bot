import { Collection } from 'discord.js';

export interface Command {
  data: any;
  execute: (interaction: any) => Promise<void>;
}

export interface MarketItem {
  name: string;
  basePrice: number;
}

export interface ShopItem {
  name: string;
  description: string;
  price: number;
  type: 'fruit' | 'tool' | 'special';
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  requirements: { item: string; amount: number }[];
  rewards: { type: 'coins' | 'experience'; amount: number }[];
  createdBy: string;
  createdAt: Date;
}

export interface UserData {
  userId: string;
  guildId: string;
  balance: number;
  level: number;
  experience: number;
  inventory: Map<string, number>;
  lastPick: Date;
  lastSteal: Date;
}

export interface RoleRequirement {
  level: number;
  balance: number;
}

export interface RoleRequirements {
  [key: string]: RoleRequirement;
}

export interface CommandsCollection extends Collection<string, Command> {} 