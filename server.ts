import { ChatGPTAPIBrowser } from "chatgpt";
import { config } from "dotenv";
import {
  Routes,
  REST,
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
} from "discord.js";

config();

// Start ChatGPT API
const api = new ChatGPTAPIBrowser({
  email: process.env.EMAIL!,
  password: process.env.PASSWORD!,
});
await api.initSession();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// const commands: SlashCommand[] = [
//   { name: "ping", description: "Ping the bot" },
//   // { name: "chat", description: "Chat with ChatGPT" },
// ];

const chatCommand = new SlashCommandBuilder()
  .setName("chat")
  .setDescription("Chat with ChatGPT")
  .addStringOption((option) =>
    option.setName("input").setDescription("Input to ChatGPT").setRequired(true)
  );

const rest = new REST({
  version: "10",
}).setToken(process.env.BOT_TOKEN!);

// Register a new slash command
(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
      body: [chatCommand.toJSON()],
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  }

  if (interaction.commandName === "chat") {
    console.log(interaction.options.data);
    if (interaction.options.data.length > 0) {
      const input = interaction.options.data[0].value;
      console.log(input);
      if (typeof input !== "string") return;
      await interaction.reply("Thinking...");
      const result = await api.sendMessage(input);
      console.log(result.response);
      await interaction.followUp(result.response);
    }
  }
});

client.login(process.env.BOT_TOKEN);
