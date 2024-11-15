// ./src/bot/loader.ts
import { Client, Collection, REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import { IBotCommand, IBotSlashCommand } from './botcommand.interface';
import { IScheduler } from './scheduler.interface';

/**
 * Função para carregar comandos de um diretório específico.
 * Ela carrega tanto comandos prefixados quanto slash commands, dependendo da opção `registerSlashCommands`.
 */
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

        if (registerSlashCommands && 'slashCommand' in command) {
          const slashCommand = (command as IBotSlashCommand).slashCommand;
          if (slashCommand) {
            commands.push(command);
            console.info(`Slash Command registrado: ${command.name} de ${relativePath}`);
          }
        }

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

/**
 * Função para carregar comandos prefixados e adicioná-los ao cliente.
 */
export async function loadCommands(
  client: Client & { commands: Collection<string, any> },
) {
  const commandDir = path.join(__dirname, '../commands');
  const commandModules = await loadCommandsFromDirectory(commandDir, commandDir, false);

  for (const commandModule of commandModules) {
    if (commandModule && 'execute' in commandModule) {
      const command = commandModule as IBotCommand;
      client.commands.set(command.name, command);
      console.info(`Comando prefixado carregado: ${command.name}`);
    }
  }
}

/**
 * Função para registrar Slash Commands na API do Discord e adicioná-los ao client.commands.
 */
export async function loadSlashCommands(
  client: Client & { commands: Collection<string, any> },
  clientId: string,
  guildId: string,
  token: string,
) {
  const commandDir = path.join(__dirname, '../commands');
  const commands = await loadCommandsFromDirectory(commandDir, commandDir, true);

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

  const commandModules = await loadCommandsFromDirectory(commandDir, commandDir, true);

  for (const commandModule of commandModules) {
    if (commandModule && 'execute' in commandModule) {
      const command = commandModule as IBotSlashCommand;
      client.commands.set(command.name, command);
      console.info(`Slash Command carregado no client.commands: ${command.name}`);
    }
  }
}

/**
 * Função para carregar agendadores de um diretório específico.
 * Ela busca todos os arquivos em `schedulers` e verifica se implementam `IScheduler`.
 */
export async function loadSchedulersFromDirectory(dir: string, baseDir: string) {
  const schedulers: IScheduler[] = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      const subSchedulers = await loadSchedulersFromDirectory(fullPath, baseDir);
      schedulers.push(...subSchedulers);
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

      try {
        const schedulerModule = await import(`../schedulers/${relativePath}`);
        const { scheduler } = schedulerModule;

        if (!scheduler || !scheduler.cronTime || typeof scheduler.execute !== 'function') {
          console.warn(`Arquivo ${relativePath} não possui um scheduler válido.`);
          continue;
        }

        schedulers.push(scheduler);
        console.info(`Scheduler carregado: ${scheduler.name} de ${relativePath}`);
      } catch (error) {
        console.error(`Erro ao carregar o scheduler em ${relativePath}:`, error);
      }
    }
  }

  return schedulers;
}

/**
 * Função para configurar e iniciar todos os agendadores carregados do diretório `schedulers`.
 */
export async function startSchedulers(client: Client) {
  const schedulerDir = path.join(__dirname, '../schedulers');
  const schedulers = await loadSchedulersFromDirectory(schedulerDir, schedulerDir);

  for (const scheduler of schedulers) {
    cron.schedule(scheduler.cronTime, async () => {
      scheduler.execute(client)
    });
    console.info(`Agendador ${scheduler.name} configurado para ${scheduler.cronTime}`);
  }
}
