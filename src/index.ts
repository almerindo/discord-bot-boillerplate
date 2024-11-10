// ./src/index.ts
import { initializeBot, setupEventListeners } from './bot/setup';
import dotenv from 'dotenv';

dotenv.config();

async function startBot() {
  const client = await initializeBot();
  setupEventListeners(client);
  const token = process.env.DISCORD_TOKEN as string;

  client.login(token).catch(error => {
    console.error('Erro ao conectar o bot:', error);
    process.exit(1);
  });
}

startBot();
