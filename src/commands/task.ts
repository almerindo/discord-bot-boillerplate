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
const description = 'Gerencia suas tarefas com várias operações como adicionar, visualizar, atualizar e deletar.';

const hasPermission = (interaction: CommandInteraction, roles: string[]) => {
  const memberRoles = interaction.member?.roles;
  return memberRoles && 'cache' in memberRoles && roles.some(role => memberRoles.cache.some(r => r.name === role));
};

const sendEphemeralResponse = async (interaction: CommandInteraction, content: string, ephemeral = true) => {
  await interaction.followUp({ content, ephemeral });
};

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

    const subcommand = (interaction.options as CommandInteractionOptionResolver).getSubcommand();
    const userId = interaction.user.id;
    const username = interaction.user.username;

    try {
      switch (subcommand) {
        case 'add':
          await handleAdd(interaction, userId, username);
          break;
        case 'get':
          await handleGet(interaction, userId);
          break;
        case 'text-update':
          await handleTextUpdate(interaction, userId);
          break;
        case 'delete':
          await handleDelete(interaction, userId);
          break;
        case 'delete-all':
          await handleDeleteAll(interaction, userId);
          break;
        case 'stats':
          await handleStats(interaction, userId);
          break;
        case 'status':
          await handleStatusUpdate(interaction, userId);
          break;
        case 'list':
          await handleList(interaction);
          break;
        default:
          await sendEphemeralResponse(interaction, 'Comando inválido.');
      }
    } catch (error) {
      console.error(`Erro ao executar o comando ${name}:`, error);
      await sendEphemeralResponse(interaction, 'Ocorreu um erro ao executar o comando.');
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
          option.setName('code').setDescription('Código único para a tarefa').setRequired(true),
        )
        .addStringOption(option =>
          option.setName('description').setDescription('Descrição da tarefa').setRequired(true),
        )
        .addUserOption(option =>
          option.setName('user').setDescription('Usuário para quem a tarefa será adicionada').setRequired(false),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('get')
        .setDescription('Exibe os detalhes de uma tarefa')
        .addStringOption(option =>
          option.setName('code').setDescription('Código da tarefa').setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('text-update')
        .setDescription('Atualiza a descrição de uma tarefa')
        .addStringOption(option =>
          option.setName('code').setDescription('Código da tarefa').setRequired(true),
        )
        .addStringOption(option =>
          option.setName('description').setDescription('Nova descrição para a tarefa').setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete')
        .setDescription('Deleta uma tarefa específica')
        .addStringOption(option =>
          option.setName('code').setDescription('Código da tarefa').setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand.setName('delete-all').setDescription('Deleta todas as tarefas do usuário'),
    )
    .addSubcommand(subcommand =>
      subcommand.setName('stats').setDescription('Mostra estatísticas das tarefas por status'),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('status')
        .setDescription('Atualiza o status de uma tarefa')
        .addStringOption(option =>
          option.setName('code').setDescription('Código da tarefa').setRequired(true),
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
        )
        .addUserOption(option =>
          option.setName('user').setDescription('Usuário da tarefa').setRequired(false),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand.setName('list').setDescription('Lista todas as tarefas'),
    ),
};

// Handlers for each command subcommand
async function handleAdd(interaction: CommandInteraction, userId: string, username: string) {
  const code = interaction.options.get('code', true).value as string;
  const description = interaction.options.get('description', true).value as string;
  const targetUserId = interaction.options.get('user')?.value as string;

  if (targetUserId && !hasPermission(interaction, ['staff', 'bug-catcher'])) {
    return sendEphemeralResponse(interaction, randomMessage());
  }

  const targetUser = targetUserId || userId;
  const targetUsername = targetUserId
    ? (await interaction.guild?.members.fetch(targetUserId))?.user.username || 'Usuário Desconhecido'
    : username;

  try {
    const todo = await todoService.addTodo(
      targetUser,
      targetUsername,
      code,
      description,
    );
    await sendEphemeralResponse(interaction, `Tarefa adicionada com sucesso para ${targetUsername}! Código: ${todo.code}, Descrição: ${todo.description}`);

    if (targetUserId && targetUserId !== userId) {
      const targetUserMember = await interaction.guild?.members.fetch(targetUserId);
      if (targetUserMember) {
        await targetUserMember.user
          .send(`Olá ${targetUserMember.user.username}, uma nova tarefa foi adicionada para você por ${interaction.user.username}: ` +
                `\n**Código**: ${todo.code}\n**Descrição**: ${todo.description}`)
          .catch(error => console.error('Erro ao enviar mensagem privada:', error));
      }
    }
  } catch (error: any) {
    await sendEphemeralResponse(interaction, error.message);
  }
}

async function handleGet(interaction: CommandInteraction, userId: string) {
  const code = interaction.options.get('code', true).value as string;
  const task = await todoService.getTodoByCode(userId, code);
  await sendEphemeralResponse(interaction, task ? `Tarefa: ${task.description} - Status: ${task.status}` : 'Tarefa não encontrada.');
}

async function handleTextUpdate(interaction: CommandInteraction, userId: string) {
  const code = interaction.options.get('code', true).value as string;
  const newDescription = interaction.options.get('description', true).value as string;
  const updatedTodo = await todoService.updateTodoText(userId, code, newDescription);
  await sendEphemeralResponse(interaction, updatedTodo ? `Descrição da tarefa atualizada com sucesso! Nova descrição: ${updatedTodo.description}` : 'Tarefa não encontrada ou você não tem permissão para atualizá-la.');
}

async function handleDelete(interaction: CommandInteraction, userId: string) {
  const code = interaction.options.get('code', true).value as string;
  const deletedTodo = await todoService.deleteTodo(userId, code);
  await sendEphemeralResponse(interaction, deletedTodo ? 'Tarefa deletada com sucesso!' : 'Tarefa não encontrada ou você não tem permissão para deletá-la.');
}

async function handleDeleteAll(interaction: CommandInteraction, userId: string) {
  await todoService.deleteAllTodos(userId);
  await sendEphemeralResponse(interaction, 'Todas as suas tarefas foram deletadas com sucesso.');
}

async function handleStats(interaction: CommandInteraction, userId: string) {
  let statistics;
  if (hasPermission(interaction, ['staff'])) {
    statistics = await todoService.getTaskStatistics();
  } else if (hasPermission(interaction, ['oreia-seca', 'bug-catcher'])) {
    statistics = await todoService.getTaskStatistics(userId);
  } else {
    return sendEphemeralResponse(interaction, randomMessage());
  }

  if (!statistics || statistics.length === 0) {
    return sendEphemeralResponse(interaction, 'Não há tarefas registradas.');
  }

  let response = 'Estatísticas das tarefas:\n';
  for (const stat of statistics) {
    response += `Usuário: ${stat._id}\n`;
    for (const status of stat.statusCounts) {
      response += `  ${status.status}: ${status.count}\n`;
    }
  }
  await sendEphemeralResponse(interaction, response);
}

async function handleStatusUpdate(interaction: CommandInteraction, userId: string) {
  const code = interaction.options.get('code', true).value as string;
  const newStatus = interaction.options.get('status', true).value as ETodoStatus;
  const statusTargetUserId = interaction.options.get('user', false)?.value as string;

  if (statusTargetUserId && !hasPermission(interaction, ['staff', 'bug-catcher'])) {
    return sendEphemeralResponse(interaction, randomMessage());
  }

  const statusTargetUser = statusTargetUserId && hasPermission(interaction, ['staff', 'bug-catcher']) ? statusTargetUserId : userId;

  if (!Object.values(ETodoStatus).includes(newStatus)) {
    return sendEphemeralResponse(interaction, 'Status inválido. Utilize `todo`, `doing` ou `done`.');
  }

  const updatedStatusTodo = await todoService.updateTodoStatus(statusTargetUser, code, newStatus);
  await sendEphemeralResponse(interaction, updatedStatusTodo ? `Status da tarefa atualizado com sucesso para ${newStatus}!` : 'Tarefa não encontrada ou você não tem permissão para atualizá-la.');
}

async function handleList(interaction: CommandInteraction) {
  const isStaffOrBugCatcher = hasPermission(interaction, ['staff', 'bug-catcher']);
  const tasks = isStaffOrBugCatcher ? await todoService.getTodosGroupedByUser() : await todoService.getTodos(interaction.user.id);

  if (!tasks || tasks.length === 0) {
    return sendEphemeralResponse(interaction, 'Não há tarefas para listar.');
  }

  let response = 'Lista de Tarefas:\n';
  if (isStaffOrBugCatcher) {
    for (const user of tasks) {
      response += `\n**Usuário**: ${user.username || user.userId}\n`;
      for (const task of user.tasks) {
        response += ` - **Código**: ${task.code} | **Status**: ${task.status} | **Descrição**: ${task.description}\n`;
      }
    }
  } else {
    for (const task of tasks) {
      response += ` - **Código**: ${task.code} | **Status**: ${task.status} | **Descrição**: ${task.description}\n`;
    }
  }

  await sendEphemeralResponse(interaction, response);
}
