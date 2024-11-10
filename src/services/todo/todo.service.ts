import { TodoModel, ITodo, ETodoStatus } from './models/todo.model';

export class TodoService {
  async addTodo(
    userId: string,
    username: string,
    code: string,
    description: string,
  ): Promise<ITodo> {
    try {
      const todo = new TodoModel({
        userId: `<@${userId}>`,
        username,
        code,
        description,
        status: ETodoStatus.TODO,
      });
      return await todo.save();
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error(
          `Já existe uma tarefa com o código "${code}" para este usuário. Por favor, escolha outro código.`,
        );
      }
      throw error;
    }
  }

  async getTodos(userId: string): Promise<ITodo[]> {
    return await TodoModel.find({ userId: `<@${userId}>` });
  }

  async updateTodoStatus(
    userId: string,
    code: string,
    status: ETodoStatus,
  ): Promise<ITodo | null> {
    const update: Partial<ITodo> = { status };
    if (status === ETodoStatus.DONE) {
      update.finishedAt = new Date();
    }
    return await TodoModel.findOneAndUpdate(
      { userId: `<@${userId}>`, code },
      update,
      { new: true },
    );
  }

  async getTodoByCode(userId: string, code: string): Promise<ITodo | null> {
    return await TodoModel.findOne({ userId: `<@${userId}>`, code });
  }

  async deleteTodo(userId: string, code: string): Promise<ITodo | null> {
    return await TodoModel.findOneAndDelete({ userId: `<@${userId}>`, code });
  }

  async deleteAllTodos(userId: string): Promise<void> {
    await TodoModel.deleteMany({ userId: `<@${userId}>` });
  }

  async getTaskStatistics(userId?: string): Promise<any> {
    const pipeline = [];

    if (userId) {
      pipeline.push({ $match: { userId: `<@${userId}>` } });
    }

    pipeline.push(
      {
        $group: {
          _id: { username: '$username', status: '$status' },
          count: { $sum: 1 },
          tasks: {
            $push: {
              code: '$code',
              description: '$description',
              createdAt: '$createdAt',
              finishedAt: '$finishedAt',
            },
          },
        },
      },
      {
        $group: {
          _id: '$_id.username',
          statusCounts: {
            $push: {
              status: '$_id.status',
              count: '$count',
              tasks: '$tasks',
            },
          },
        },
      },
    );

    return await TodoModel.aggregate(pipeline);
  }

  async updateTodoText(
    userId: string,
    code: string,
    newDescription: string,
  ): Promise<ITodo | null> {
    return await TodoModel.findOneAndUpdate(
      { userId: `<@${userId}>`, code },
      { description: newDescription },
      { new: true },
    );
  }

  // Method to retrieve all tasks, grouped by user
  async getTodosGroupedByUser(): Promise<any> {
    return await TodoModel.aggregate([
      {
        $group: {
          _id: '$userId',
          username: { $first: '$username' },
          tasks: {
            $push: {
              code: '$code',
              description: '$description',
              status: '$status',
              createdAt: '$createdAt',
              finishedAt: '$finishedAt',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          username: 1,
          tasks: 1,
        },
      },
    ]);
  }

  async getOverdueTasks(days: number = 3): Promise<ITodo[]> {
    const now = new Date();
    const overdueDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return await TodoModel.find({
      status: { $ne: 'done' },
      createdAt: { $lte: overdueDate },
    }).exec();
  }
}
