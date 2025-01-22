const {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    ActivityType,
    InteractionType,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder
} = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('node:path');
require("dotenv").config();


const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}





client.login(process.env.DISCORD_BOT_TOKEN);
