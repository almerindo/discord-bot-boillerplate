import { Message } from 'discord.js';
import { IBotCommand } from './botcommand.interface';

export function hasPermission(command: IBotCommand, message: Message): boolean {
  // Verifique se o comando está sendo usado em um servidor
  if (!message.member) {
    message.reply('Este comando só pode ser usado em um servidor.');
    return false;
  }

  // Verifica se o comando permite todos os cargos
  const allowedRoles = command.allowedBy || new Set(['all']);

  // Verifica se `allowedBy` contém "all" ou se o usuário tem algum dos cargos permitidos
  if (allowedRoles.has('all')) {
    return true;
  }

  // Verifica se o autor da mensagem possui algum dos cargos permitidos
  const userRoles = message.member.roles.cache;
  return userRoles
    ? userRoles.some(role => allowedRoles.has(role.name))
    : false;
}
