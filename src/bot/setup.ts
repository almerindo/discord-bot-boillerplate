// ./src/bot/botSetup.ts
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { loadCommands, loadSlashCommands } from './loader';
import { scheduleTaskReminder } from './scheduler';

dotenv.config();

interface ExtendedClient extends Client {
  commands: Collection<string, any>;
}

const client: ExtendedClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
  ],
}) as ExtendedClient;

export async function initializeBot(): Promise<ExtendedClient> {
  const clientId = process.env.CLIENT_ID as string;
  const guildId = process.env.GUILD_ID as string;
  const token = process.env.DISCORD_TOKEN as string;
  const mongoUri = process.env.MONGO_URI as string;
  const channelId = process.env.GENERAL_CHANNEL_ID as string;
  const cronTime = process.env.TASK_REMINDER_CRON as string;
  const taskOverdueDays = parseInt(process.env.TASK_OVERDUE_DAYS as string) || 3;

  if (!mongoUri || !clientId || !guildId || !token || !channelId || !cronTime) {
    console.error('Alguma variável de ambiente necessária não está definida no arquivo .env');
    process.exit(1);
  }

  // Conexão com MongoDB
  await mongoose.connect(mongoUri);
  console.log('Conectado ao MongoDB');

  // Configurações do cliente Discord
  const client: ExtendedClient = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.GuildMembers,
    ],
  }) as ExtendedClient;

  client.commands = new Collection();

  // Inicialização dos comandos e agendamentos
  client.once('ready', async () => {
    console.log(`Bot conectado como ${client.user?.tag}`);
    await loadCommands(client);
    await loadSlashCommands(client, clientId, guildId, token);
    scheduleTaskReminder(client, guildId, channelId, taskOverdueDays, cronTime);
  });

  return client;
}

export function setupEventListeners(client: ExtendedClient) {
  client.on('messageCreate', async message => {
    if (message.channel.type === 1 && !message.author.bot) {
      await message.reply(
        'Ainda não processo DMs, por favor, utilize os comandos em um servidor.',
      );
    }
  });

  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      console.info(`Comando ${command.name} foi executado por ${interaction.user.tag}`);
      await command.execute(interaction);
    } catch (error) {
      console.error('Erro ao executar o Slash Command:', error);
      await interaction.reply({
        content: 'Ocorreu um erro ao executar o comando.',
        ephemeral: true,
      });
    }
  });
}
