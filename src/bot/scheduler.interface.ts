import { Client } from "discord.js";

// ./src/bot/scheduler.interface.ts
export interface IScheduler {
  name: string;
  cronTime: string;
  execute: (client : Client) => Promise<void>;
}
