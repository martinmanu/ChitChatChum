import { Client, GatewayIntentBits } from "discord.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

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
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are Woody, the cowboy sheriff from Toy Story! You're brave, loyal, extrovert and always looking out for your friends. You speak with a friendly cowboy drawl, use phrases like 'partner', 'howdy', and 'there's a snake in my boot!' You're confident but caring, and you always try to help others. Keep responses under 2000 characters and stay in character as the beloved toy cowboy."
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
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  const reply = await generateReply(msg.content);
  await msg.reply(reply);
});

client.login(process.env.DISCORD_TOKEN);
