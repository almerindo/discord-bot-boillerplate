// ./src/bot/loader.ts
import { Client, Collection, REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { IBotCommand, IBotSlashCommand } from './botcommand.interface';

async function loadCommandsFromDirectory(
  dir: string,
  baseDir: string,
  registerSlashCommands: boolean = false,
) {
  const commands = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      const subCommands: any = await loadCommandsFromDirectory(
        fullPath,
        baseDir,
        registerSlashCommands,
      );
      commands.push(...subCommands);
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

      try {
        const commandModule = await import(`../commands/${relativePath}`);
        const { command } = commandModule;

        if (!command || !command.name) {
          console.warn(`Arquivo ${relativePath} não possui um comando válido.`);
          continue;
        }

        // Adiciona ao array de comandos se for um Slash Command
        if (registerSlashCommands && 'slashCommand' in command) {
          const slashCommand = (command as IBotSlashCommand).slashCommand;
          if (slashCommand) {
            commands.push(command);
            console.info(
              `Slash Command registrado: ${command.name} de ${relativePath}`,
            );
          }
        }

        // Adiciona ao array de comandos prefixados se não for um Slash Command
        if (!registerSlashCommands && !('slashCommand' in command)) {
          commands.push(command);
        }
      } catch (error) {
        console.error(`Erro ao carregar o comando em ${relativePath}:`, error);
      }
    }
  }

  return commands;
}

// Carrega comandos prefixados e adiciona ao cliente
export async function loadCommands(
  client: Client & { commands: Collection<string, any> },
) {
  const commandDir = path.join(__dirname, '../commands');
  const commandModules = await loadCommandsFromDirectory(
    commandDir,
    commandDir,
    false,
  );

  for (const commandModule of commandModules) {
    if (commandModule && 'execute' in commandModule) {
      const command = commandModule as IBotCommand;
      client.commands.set(command.name, command);
      console.info(`Comando prefixado carregado: ${command.name}`);
    }
  }
}

// Registra Slash Commands na API do Discord e adiciona ao client.commands
export async function loadSlashCommands(
  client: Client & { commands: Collection<string, any> },
  clientId: string,
  guildId: string,
  token: string,
) {
  const commandDir = path.join(__dirname, '../commands');
  const commands = await loadCommandsFromDirectory(
    commandDir,
    commandDir,
    true,
  );

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log('Registrando Slash Commands...');
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands.map(c => c.slashCommand.toJSON()),
    });
    console.log('Slash Commands registrados com sucesso!');
  } catch (error) {
    console.error('Erro ao registrar Slash Commands:', error);
  }

  // Armazenar Slash Commands em client.commands
  const commandModules = await loadCommandsFromDirectory(
    commandDir,
    commandDir,
    true,
  );

  for (const commandModule of commandModules) {
    if (commandModule && 'execute' in commandModule) {
      const command = commandModule as IBotSlashCommand;
      client.commands.set(command.name, command);

      console.info(
        `Slash Command carregado no client.commands: ${command.name}`,
      );
    }
  }
}
