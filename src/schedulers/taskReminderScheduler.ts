// ./src/bot/schedulers/taskReminderScheduler.ts
import { IScheduler } from '../bot/scheduler.interface';
import { TextChannel, Client } from 'discord.js';
import { TodoService } from '../services/todo/todo.service';
import { getOnTimeMessage, getOverdueTaskMessage } from '../bot/messages';

const todoService = new TodoService();

export const scheduler: IScheduler = {  // Alterado para 'scheduler'
  name: 'TaskReminderScheduler',
  cronTime: '0 9 * * *', // Executa diariamente às 9h

  execute: async (client: Client) => {
    const guildId = process.env.GUILD_ID as string;
    const channelId = process.env.GENERAL_CHANNEL_ID as string;
    const limitInDays = parseInt(process.env.TASK_OVERDUE_DAYS as string) || 3;

    try {
      const guild = await client.guilds.fetch(guildId);
      const channel = guild.channels.cache.get(channelId) as TextChannel;

      if (!channel) {
        console.error('Canal #geral não encontrado');
        return;
      }

      const pendingTasks = await todoService.getOverdueTasks(limitInDays);

      if (pendingTasks.length === 0) {
        await channel.send(getOnTimeMessage());
        return;
      }

      let message = '📅 **Relatório de Tarefas Atrasadas** 📅\n';
      for (const task of pendingTasks) {
        const createdAt = task.createdAt;
        const elapsedDays = Math.floor(
          (new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
        );

        message += `${getOverdueTaskMessage(task.username, task.code, elapsedDays, task.description)}\n`;
      }

      await channel.send(message);
    } catch (error) {
      console.error('Erro ao enviar o relatório de tarefas atrasadas:', error);
    }
  },
};
