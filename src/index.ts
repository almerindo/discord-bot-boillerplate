import { Client, GatewayIntentBits, Collection } from 'discord.js';
import dotenv from 'dotenv';
import { loadCommands, loadSlashCommands } from './bot/loader';
import mongoose from 'mongoose';

dotenv.config();

const mongoUri = process.env.MONGO_URI;
const clientId = process.env.CLIENT_ID as string;
const guildId = process.env.GUILD_ID as string;
const token = process.env.DISCORD_TOKEN as string;

if (!mongoUri || !clientId || !guildId || !token) {
    console.error('Alguma variável de ambiente necessária não está definida no arquivo .env');
    process.exit(1);
}

mongoose.connect(mongoUri)
    .then(() => console.log('Conectado ao MongoDB'))
    .catch(err => {
        console.error('Erro ao conectar ao MongoDB:', err);
        process.exit(1);
    });

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


client.commands = new Collection();

client.once('ready', async () => {
    console.log(`Bot conectado como ${client.user?.tag}`);

    // Carregar comandos prefixados e adicionar ao cliente
    await loadCommands(client);

    // Registrar Slash Commands
    await loadSlashCommands(client, clientId, guildId, token);
});

client.on('messageCreate', async (message) => {
  // Verifica se a mensagem é uma DM e se não foi enviada pelo bot
  console.info(message.content)
  if (message.channel.type === 1 && !message.author.bot) {
    await message.reply('Ainda não processo DMs, por favor, utilize os comandos em um servidor.');
  }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        console.info(`Comando ${command.name} foi executado por ${interaction.user.tag}`);
        await command.execute(interaction);
    } catch (error) {
        console.error('Erro ao executar o Slash Command:', error);
        await interaction.reply({ content: 'Ocorreu um erro ao executar o comando.', ephemeral: true });
    }
});

client.login(token);
