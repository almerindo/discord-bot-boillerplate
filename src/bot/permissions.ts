//src/bot/permissions.ts
import { CommandInteraction, Message } from 'discord.js';
import { IBotCommand } from './botcommand.interface';

export const hasPermission = (interaction: CommandInteraction, roles: string[]) => {
  const memberRoles = interaction.member?.roles;
  return (
    memberRoles &&
    'cache' in memberRoles &&
    roles.some(role => memberRoles.cache.some(r => r.name === role))
  );
};
