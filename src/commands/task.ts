// ./src/commands/task.ts
import {
  CacheType,
  CommandInteraction,
  CommandInteractionOptionResolver,
  SlashCommandBuilder,
} from 'discord.js';
import { IBotSlashCommand } from '../bot/botcommand.interface';
import { TodoService } from '../services/todo/todo.service';
import { randomMessage } from '../bot/messages';
import { ETodoStatus } from '../services/todo/models/todo.model';

const todoService = new TodoService();

const group = 'todo';
const name = 'task';
const description =
  'Gerencia suas tarefas com várias operações como adicionar, visualizar, atualizar e deletar.';

export const command: IBotSlashCommand = {
  group,
  name,
  description,
  allowedBy: new Set(['staff', 'bug-catcher', 'oreia-seca']),
  usage: `
**/task** <ação> \`<opções>\`
- Realiza uma das várias ações de gerenciamento de tarefas, como adicionar, visualizar e atualizar tarefas.
`,

  async execute(interaction: CommandInteraction<CacheType>) {
    await interaction.deferReply({ ephemeral: true });

    const subcommand = (
      interaction.options as CommandInteractionOptionResolver
    ).getSubcommand();
    const userId = interaction.user.id;
    const username = interaction.user.username;

    const hasPermission = (roles: string[]) => {
      const memberRoles = interaction.member?.roles;
      if (!memberRoles || !('cache' in memberRoles)) return false;
      return roles.some(role => memberRoles.cache.some(r => r.name === role));
    };

    try {
      switch (subcommand) {
        case 'add':
          const codeAdd = interaction.options.get('code', true).value as string;
          const descriptionAdd = interaction.options.get('description', true)
            .value as string;
          const targetUserId = interaction.options.get('user')?.value as string;

          if (targetUserId && !hasPermission(['staff', 'bug-catcher'])) {
            return interaction.followUp({
              content:
                'Você não tem permissão para adicionar uma tarefa para outro usuário.',
              ephemeral: true,
            });
          }

          const targetUser = targetUserId || userId;
          const targetUsername = targetUserId
            ? (await interaction.guild?.members.fetch(targetUserId))?.user
                .username || 'Usuário Desconhecido'
            : username;

          const todo = await todoService.addTodo(
            targetUser,
            targetUsername,
            codeAdd,
            descriptionAdd,
          );
          await interaction.followUp({
            content: `Tarefa adicionada com sucesso para ${targetUsername}! Código: ${todo.code}, Descrição: ${todo.description}`,
            ephemeral: true,
          });

          if (targetUserId && targetUserId !== userId) {
            const targetUserMember = await interaction.guild?.members.fetch(
              targetUserId,
            );
            if (targetUserMember) {
              await targetUserMember.user
                .send(
                  `Olá ${targetUserMember.user.username}, uma nova tarefa foi adicionada para você por ${interaction.user.username}: ` +
                    `\n**Código**: ${todo.code}\n**Descrição**: ${todo.description}`,
                )
                .catch(error =>
                  console.error('Erro ao enviar mensagem privada:', error),
                );
            }
          }
          break;

        case 'get':
          const codeGet = interaction.options.get('code', true).value as string;
          const task = await todoService.getTodoByCode(userId, codeGet);
          if (!task) {
            await interaction.followUp({
              content: 'Tarefa não encontrada.',
              ephemeral: true,
            });
          } else {
            await interaction.followUp({
              content: `Tarefa: ${task.description} - Status: ${task.status}`,
              ephemeral: true,
            });
          }
          break;

        case 'text-update':
          const codeTextUpdate = interaction.options.get('code', true)
            .value as string;
          const newDescription = interaction.options.get('description', true)
            .value as string;
          const updatedTodo = await todoService.updateTodoText(
            userId,
            codeTextUpdate,
            newDescription,
          );
          if (!updatedTodo) {
            await interaction.followUp({
              content:
                'Tarefa não encontrada ou você não tem permissão para atualizá-la.',
              ephemeral: true,
            });
          } else {
            await interaction.followUp({
              content: `Descrição da tarefa atualizada com sucesso! Nova descrição: ${updatedTodo.description}`,
              ephemeral: true,
            });
          }
          break;

        case 'delete':
          const codeDelete = interaction.options.get('code', true)
            .value as string;
          const deletedTodo = await todoService.deleteTodo(userId, codeDelete);
          if (!deletedTodo) {
            await interaction.followUp({
              content:
                'Tarefa não encontrada ou você não tem permissão para deletá-la.',
              ephemeral: true,
            });
          } else {
            await interaction.followUp({
              content: `Tarefa deletada com sucesso!`,
              ephemeral: true,
            });
          }
          break;

        case 'delete-all':
          await todoService.deleteAllTodos(userId);
          await interaction.followUp({
            content: 'Todas as suas tarefas foram deletadas com sucesso.',
            ephemeral: true,
          });
          break;

        case 'stats':
          let statistics;
          if (hasPermission(['staff'])) {
            statistics = await todoService.getTaskStatistics();
          } else if (hasPermission(['oreia-seca', 'bug-catcher'])) {
            statistics = await todoService.getTaskStatistics(userId);
          } else {
            return interaction.followUp({
              content: randomMessage(),
              ephemeral: true,
            });
          }

          if (!statistics || statistics.length === 0) {
            await interaction.followUp({
              content: 'Não há tarefas registradas.',
              ephemeral: true,
            });
            return;
          }

          let response = 'Estatísticas das tarefas:\n';
          for (const stat of statistics) {
            response += `Usuário: ${stat._id}\n`;
            for (const status of stat.statusCounts) {
              response += `  ${status.status}: ${status.count}\n`;
            }
          }
          await interaction.followUp({ content: response, ephemeral: true });
          break;

        case 'status':
          const codeStatus = interaction.options.get('code', true)
            .value as string;
          const newStatus = interaction.options.get('status', true)
            .value as ETodoStatus;
          const statusTargetUserId = interaction.options.get('user', false)
            ?.value as string;

          const statusTargetUser =
            statusTargetUserId && hasPermission(['staff', 'bug-catcher'])
              ? statusTargetUserId
              : userId;

          if (!Object.values(ETodoStatus).includes(newStatus)) {
            return interaction.followUp({
              content: 'Status inválido. Utilize `todo`, `doing` ou `done`.',
              ephemeral: true,
            });
          }

          const updatedStatusTodo = await todoService.updateTodoStatus(
            statusTargetUser,
            codeStatus,
            newStatus,
          );
          if (!updatedStatusTodo) {
            await interaction.followUp({
              content:
                'Tarefa não encontrada ou você não tem permissão para atualizá-la.',
              ephemeral: true,
            });
          } else {
            await interaction.followUp({
              content: `Status da tarefa atualizado com sucesso para ${newStatus}!`,
              ephemeral: true,
            });
          }
          break;

        case 'list':
          const isStaffOrBugCatcher = hasPermission(['staff', 'bug-catcher']);

          let tasks;

          if (isStaffOrBugCatcher) {
            tasks = await todoService.getTodosGroupedByUser();
          } else {
            tasks = await todoService.getTodos(userId);
          }

          if (!tasks || tasks.length === 0) {
            await interaction.followUp({
              content: 'Não há tarefas para listar.',
              ephemeral: true,
            });
            return;
          }

          let listResponse = 'Lista de Tarefas:\n';

          if (isStaffOrBugCatcher) {
            for (const user of tasks) {
              listResponse += `\n**Usuário**: ${
                user.username || user.userId
              }\n`;
              for (const task of user.tasks) {
                listResponse += ` - **Código**: ${task.code} | **Status**: ${task.status} | **Descrição**: ${task.description}\n`;
              }
            }
          } else {
            for (const task of tasks) {
              listResponse += ` - **Código**: ${task.code} | **Status**: ${task.status} | **Descrição**: ${task.description}\n`;
            }
          }

          await interaction.followUp({
            content: listResponse,
            ephemeral: true,
          });
          break;

        default:
          await interaction.followUp({
            content: 'Comando inválido.',
            ephemeral: true,
          });
      }
    } catch (error) {
      console.error(`Erro ao executar o comando ${name}:`, error);
      await interaction.followUp({
        content: 'Ocorreu um erro ao executar o comando.',
        ephemeral: true,
      });
    }
  },

  slashCommand: new SlashCommandBuilder()
    .setName(name)
    .setDescription(description)
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Adiciona uma nova tarefa')
        .addStringOption(option =>
          option
            .setName('code')
            .setDescription('Código único para a tarefa')
            .setRequired(true),
        )
        .addStringOption(option =>
          option
            .setName('description')
            .setDescription('Descrição da tarefa')
            .setRequired(true),
        )
        .addUserOption(option =>
          option
            .setName('user')
            .setDescription('Usuário para quem a tarefa será adicionada')
            .setRequired(false),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('get')
        .setDescription('Exibe os detalhes de uma tarefa')
        .addStringOption(option =>
          option
            .setName('code')
            .setDescription('Código da tarefa')
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('text-update')
        .setDescription('Atualiza a descrição de uma tarefa')
        .addStringOption(option =>
          option
            .setName('code')
            .setDescription('Código da tarefa')
            .setRequired(true),
        )
        .addStringOption(option =>
          option
            .setName('description')
            .setDescription('Nova descrição para a tarefa')
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete')
        .setDescription('Deleta uma tarefa específica')
        .addStringOption(option =>
          option
            .setName('code')
            .setDescription('Código da tarefa')
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete-all')
        .setDescription('Deleta todas as tarefas do usuário'),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('stats')
        .setDescription('Mostra estatísticas das tarefas por status'),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('status')
        .setDescription('Atualiza o status de uma tarefa')
        .addStringOption(option =>
          option
            .setName('code')
            .setDescription('Código da tarefa')
            .setRequired(true),
        )
        .addStringOption(option =>
          option
            .setName('status')
            .setDescription('Novo status da tarefa (todo, doing, done)')
            .setRequired(true)
            .addChoices(
              { name: 'todo', value: ETodoStatus.TODO },
              { name: 'doing', value: ETodoStatus.DOING },
              { name: 'done', value: ETodoStatus.DONE },
            ),
        ).addUserOption(option =>
          option
            .setName('user')
            .setDescription('Usuário da tarefa')
            .setRequired(false),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('Lista todas as tarefas')
    ),
};
