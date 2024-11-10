// ./src/commands/shutdown.ts
import { CacheType, CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { hasPermission } from '../bot/permissions';
import { IBotSlashCommand } from '../bot/botcommand.interface';

export const command: IBotSlashCommand = {
    group: 'admin',
    usage: 'shutdown',
    name: 'shutdown',
    description: 'Disconnect the bot and stop the service.',
    allowedBy: new Set(['staff']),  // Restrict this command to "staff" role

    async execute(interaction: CommandInteraction<CacheType>) {
        // Use hasPermission to check if the user has the correct role
        if (!hasPermission(interaction,['staff'])) {
            await interaction.reply({ content: 'You don\'t have permission to run this command.', ephemeral: true });
            return;
        }

        await interaction.client.user?.setPresence({ status: 'invisible' });

        await interaction.reply({ content: 'Bot is shutting down... 👋', ephemeral: true });

        // Disconnect from Discord and stop the Node.js process
        interaction.client.destroy();  // Disconnect the bot
        process.exit(0);  // Exit Node.js process
    },

    slashCommand: new SlashCommandBuilder()
        .setName('shutdown')
        .setDescription('Disconnect the bot and stop the service'),
};
