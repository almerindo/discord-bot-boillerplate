// ./src/bot/taskScheduler.ts
import cron from 'node-cron';
import { TextChannel, Client } from 'discord.js';
import { TodoService } from '../services/todo/todo.service';

const todoService = new TodoService();

export const scheduleTaskReminder = (
  client: Client,
  guildId: string,
  channelId: string,
  limitInDays: number = 3,
  cronTime: string = '0 9 * * *'
) => {
  cron.schedule(cronTime, async () => {
    const guild = await client.guilds.fetch(guildId);
    const channel = guild.channels.cache.get(channelId) as TextChannel;

    if (!channel) {
      console.error('Canal #geral não encontrado');
      return;
    }

    try {
      const pendingTasks = await todoService.getOverdueTasks(limitInDays); // Define o limite de dias de atraso

      if (pendingTasks.length === 0) {
        await channel.send("Parece que todos estão com suas tarefas em dia! 🎉");
        return;
      }

      let message = '📅 **Relatório de Tarefas Atrasadas** 📅\n';
      for (const task of pendingTasks) {
        const createdAt = task.createdAt;
        const elapsedDays = Math.floor(
          (new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
        );

        message += `\n👤 **${task.username}** - Código da Tarefa: ${task.code} \n`;
        message += `⏳ **Atraso**: ${elapsedDays} dias! 😅 Você sabe o que é uma deadline, né?\n`;
        message += `📋 Descrição: ${task.description}\n`;
      }

      await channel.send(message);
    } catch (error) {
      console.error('Erro ao enviar o relatório de tarefas atrasadas:', error);
    }
  });
};
