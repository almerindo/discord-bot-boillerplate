//src/bot/permissions.ts
import { CommandInteraction} from 'discord.js';

export const hasPermission = (interaction: CommandInteraction, roles: string[]) => {
  const memberRoles = interaction.member?.roles;
  return (
    memberRoles &&
    'cache' in memberRoles &&
    roles.some(role => memberRoles.cache.some(r => r.name === role))
  );
};
