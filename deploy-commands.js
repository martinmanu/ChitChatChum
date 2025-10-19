import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const commands = [
  new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configure bot settings')
    .addSubcommand(subcommand =>
      subcommand
        .setName('character')
        .setDescription('Change bot character')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Character name')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('ping')
        .setDescription('Toggle ping-only mode')
        .addBooleanOption(option =>
          option.setName('enabled')
            .setDescription('Enable ping-only mode')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('List available characters and settings')),
  new SlashCommandBuilder()
    .setName('characters')
    .setDescription('Interactive character selection menu')
].map(command => command.toJSON());

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

try {
  console.log('Registering slash commands...');
  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    { body: commands }
  );
  console.log('✅ Slash commands registered!');
} catch (error) {
  console.error('❌ Error registering commands:', error);
}