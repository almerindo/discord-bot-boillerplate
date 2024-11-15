// ./src/bot/botSetup.ts
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { loadCommands, loadSlashCommands, startSchedulers } from './loader';

dotenv.config();

interface ExtendedClient extends Client {
  commands: Collection<string, any>;
}

export async function initializeBot(): Promise<ExtendedClient> {
  const clientId = process.env.CLIENT_ID as string;
  const guildId = process.env.GUILD_ID as string;
  const token = process.env.DISCORD_TOKEN as string;
  const mongoUri = process.env.MONGO_URI as string;

  if (!mongoUri || !clientId || !guildId || !token) {
    console.error('Alguma variável de ambiente necessária não está definida no arquivo .env');
    process.exit(1);
  }

  // Conexão com MongoDB
  await mongoose.connect(mongoUri);
  console.log('Conectado ao MongoDB');

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

  client.once('ready', async () => {
    console.log(`Bot conectado como ${client.user?.tag}`);

    // Carrega e registra comandos prefixados e slash commands
    await loadCommands(client);
    await loadSlashCommands(client, clientId, guildId, token);

    // Inicia todos os agendadores dinamicamente
    await startSchedulers(client);
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
