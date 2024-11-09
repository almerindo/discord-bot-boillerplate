import {
  CacheType,
  CommandInteraction,
  Message,
  SlashCommandBuilder,
} from 'discord.js';

export interface IBotCommand {
  group: string;
  name: string;
  description: string;
  allowedBy?: Set<string>;
  usage: string;
  execute: (message: Message, args: string[]) => Promise<any>;
}

export interface IBotSlashCommand {
  group: string;
  name: string;
  description: string;
  allowedBy?: Set<string>;
  usage: string;
  execute: (interaction: CommandInteraction<CacheType>) => Promise<any>;

  slashCommand: any;
}
