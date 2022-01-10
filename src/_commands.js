import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import dotenv from "dotenv";
import fileSystem from "fs";
dotenv.config();

const games = await Promise.all(
	fileSystem.readdirSync(new URL("./games", import.meta.url).toString()).map(async (file) => {
		return (await import("./games/" + file)).default;
	}),
);

const commands = [
	new SlashCommandBuilder().setName("ping").setDescription("Show ping info"),
	new SlashCommandBuilder().setName("invite").setDescription("Invite the bot"),
	// new SlashCommandBuilder()
	// 	.setName("dashboard")
	// 	.setDescription("Configure the bot on the dashboard"),
	new SlashCommandBuilder()
		.setName("set-game")
		.setDescription("Initiate game in this channel")
		.addStringOption((option) => {
			return games.reduce((opt, game) => {
				return opt.addChoice(game.name, game.name);
			}, option.setName("game").setDescription("The game you want to initialize").setRequired(true));
		}),
	new SlashCommandBuilder()
		.setName("set-last")
		.setDescription("Force post a message")
		.addStringOption((option) => {
			return option
				.setName("message")
				.setDescription("The message you want to post")
				.setRequired(true);
		}),
	new SlashCommandBuilder()
		.setName("set-logs")
		.setDescription("Set up logs in this channel")
		.addStringOption((option) => {
			return games.reduce((opt, game) => {
				return opt.addChoice(game.name, game.name);
			}, option.setName("game").setDescription("The game you want to log here. Leave blank to log all games here by default."));
		}),
].map((command) => command.toJSON());

const rest = new REST({ version: "9" }).setToken(`${process.env.BOT_TOKEN}`);

export default Promise.all([
	rest.put(Routes.applicationCommands("823932474118635540"), { body: commands }),
	rest.put(Routes.applicationCommands("897668755604250654"), { body: commands }),
])
	.then(() => console.log("Successfully registered application commands."))
	.catch(console.error);
