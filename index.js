import { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import express from "express";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

let config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

console.log('Starting bot...');

async function generateReply(message) {
  try {
    const character = config.characters[config.settings.currentCharacter];
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: character.prompt
          },
          {
            role: "user",
            content: message
          }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 20000
      }
    );

    const text = response.data.choices[0]?.message?.content || "I'm not sure what to say, but hi anyway! 😄";
    return text.slice(0, 2000);
  } catch (err) {
    console.error("Error generating reply:", err.response?.data || err.message);
    return "Oops, something went wrong 😅";
  }
}

client.once("clientReady", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  
  // Check if bot's username matches any character
  const botUsername = client.user.username;
  const matchedChar = Object.entries(config.characters).find(([key, char]) => char.name === botUsername);
  
  if (matchedChar) {
    const [charKey] = matchedChar;
    if (config.settings.currentCharacter !== charKey) {
      config.settings.currentCharacter = charKey;
      fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
      console.log(`🎭 Character synced to ${botUsername}`);
    }
  }
});

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'config') {
      const subcommand = interaction.options.getSubcommand();
      
      if (subcommand === 'character') {
        const characterName = interaction.options.getString('name');
        if (config.characters[characterName]) {
          await interaction.reply(`Character changed to ${config.characters[characterName].name}!`);
          changeCharacter(characterName).catch(console.error);
        } else {
          await interaction.reply(`Character not found. Available: ${Object.keys(config.characters).join(', ')}`);
        }
      }
      
      if (subcommand === 'ping') {
        const enabled = interaction.options.getBoolean('enabled');
        config.settings.respondOnlyWhenPinged = enabled;
        fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
        await interaction.reply(`Ping mode: ${enabled ? 'ON' : 'OFF'}`);
      }
      
      if (subcommand === 'list') {
        const chars = Object.entries(config.characters).map(([key, char]) => `${key}: ${char.name}`).join('\n');
        await interaction.reply(`**Characters:**\n${chars}\n\n**Current:** ${config.characters[config.settings.currentCharacter].name}\n**Ping Mode:** ${config.settings.respondOnlyWhenPinged ? 'ON' : 'OFF'}`);
      }
    }
    
    if (interaction.commandName === 'characters') {
      await showCharacterSelector(interaction);
    }
  }
  
  if (interaction.isButton()) {
    if (interaction.customId.startsWith('char_')) {
      const characterKey = interaction.customId.replace('char_', '');
      if (config.characters[characterKey]) {
        await interaction.update({
          content: `✅ Character changed to **${config.characters[characterKey].name}**!`,
          embeds: [],
          components: []
        });
        changeCharacter(characterKey).catch(console.error);
      }
    }
  }
});

async function changeCharacter(characterKey) {
  config.settings.currentCharacter = characterKey;
  fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
  config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
  
  // Change bot's avatar and username if possible
  const character = config.characters[characterKey];
  try {
    // Try to change avatar if file exists
    if (character.avatar && fs.existsSync(character.avatar)) {
      await client.user.setAvatar(character.avatar);
      console.log(`✅ Avatar changed to ${character.name}`);
    }
  } catch (err) {
    console.log('Cannot change avatar (rate limited or file not found)');
  }
  
  try {
    await client.user.setUsername(character.name);
    console.log(`✅ Username changed to ${character.name}`);
  } catch (err) {
    console.log('Cannot change username (rate limited)');
  }
}

async function showCharacterSelector(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('🎭 Character Selection')
    .setDescription('Choose a character for the bot to roleplay as:')
    .setColor(0x00AE86)
    .addFields(
      { name: 'Current Character', value: `**${config.characters[config.settings.currentCharacter].name}**`, inline: true }
    );

  const characters = Object.entries(config.characters);
  const rows = [];
  
  for (let i = 0; i < characters.length; i += 5) {
    const row = new ActionRowBuilder();
    const chunk = characters.slice(i, i + 5);
    
    chunk.forEach(([key, char]) => {
      const button = new ButtonBuilder()
        .setCustomId(`char_${key}`)
        .setLabel(char.name)
        .setStyle(key === config.settings.currentCharacter ? ButtonStyle.Success : ButtonStyle.Primary);
      row.addComponents(button);
    });
    
    rows.push(row);
  }

  await interaction.reply({
    embeds: [embed],
    components: rows,
    ephemeral: true
  });
}

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  if (config.settings.respondOnlyWhenPinged && !msg.mentions.has(client.user)) {
    return;
  }

  const reply = await generateReply(msg.content);
  await msg.reply(reply);
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', bot: client.user?.tag, uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`Health server running on port ${PORT}`);
});

// Self-ping every 10 minutes to prevent Render from spinning down
setInterval(() => {
  axios.get('https://discord-llama-bot.onrender.com/')
    .then(() => console.log('✅ Self-ping successful'))
    .catch(() => console.log('⚠️ Self-ping failed'));
}, 10 * 60 * 1000);

client.login(process.env.DISCORD_TOKEN);
