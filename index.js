const { Client, GatewayIntentBits, REST, Routes, ActivityType, InteractionType } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
require("dotenv").config();

// Create a new Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// File path for the linked accounts JSON file
const linkedAccountsFilePath = './linkedAccounts.json';

// Function to load linked accounts from JSON file
function loadLinkedAccounts() {
    if (!fs.existsSync(linkedAccountsFilePath)) {
        return {};
    }
    const data = fs.readFileSync(linkedAccountsFilePath);
    return JSON.parse(data);
}

// Load linked accounts on startup
let linkedAccounts = loadLinkedAccounts();

// Function to save linked accounts to JSON file
function saveLinkedAccounts() {
    fs.writeFileSync(linkedAccountsFilePath, JSON.stringify(linkedAccounts, null, 2));
}

// Function to get Lucky Block stats from Hypixel API
async function getLuckyBlockStats(gameType, playerName) {
    const url = `https://api.hypixel.net/player?key=${process.env.HYPIXEL_API_KEY}&name=${playerName}`;
    try {
        const response = await axios.get(url);
        
        if (response.data.cause === 'You have already looked up this name recently') {
            return 'You have already looked up this name recently. Please wait a while before trying again.';
        }

        const playerData = response.data.player;

        if (!playerData || !playerData.stats || !playerData.stats.Bedwars) {
            return `Player ${playerName} not found or no Bedwars stats available.`;
        }

        const modePrefix = gameType === 'Duos' ? 'eight_two_lucky' : 'four_four_lucky';

        const luckyBlockStats = {
            "Winstreak": playerData.stats.Bedwars[`${modePrefix}_winstreak`] || 0,
            "Games Played": playerData.stats.Bedwars[`${modePrefix}_games_played_bedwars`] || 0,
            "Wins": playerData.stats.Bedwars[`${modePrefix}_wins_bedwars`] || 0,
            "Loss": playerData.stats.Bedwars[`${modePrefix}_losses_bedwars`] || 0,
            "Beds Broken": playerData.stats.Bedwars[`${modePrefix}_beds_broken_bedwars`] || 0,
            "Beds Lost": playerData.stats.Bedwars[`${modePrefix}_beds_lost_bedwars`] || 0,
            "Kills": playerData.stats.Bedwars[`${modePrefix}_kills_bedwars`] || 0,
            "Fall Damage Kills": playerData.stats.Bedwars[`${modePrefix}_fall_kills_bedwars`] || 0,
            "Void Kills": playerData.stats.Bedwars[`${modePrefix}_void_kills_bedwars`] || 0,
            "Mob Kills": playerData.stats.Bedwars[`${modePrefix}_entity_attack_kills_bedwars`] || 0,
            "Creeper Kills": playerData.stats.Bedwars[`${modePrefix}_entity_explosion_kills_bedwars`] || 0,
            "Thorn Kills": playerData.stats.Bedwars[`${modePrefix}_thorn_kills_bedwars`] || 0,
            "Deaths": playerData.stats.Bedwars[`${modePrefix}_deaths_bedwars`] || 0,
            "Void Deaths": playerData.stats.Bedwars[`${modePrefix}_void_deaths_bedwars`] || 0,
            "Mob Deaths": playerData.stats.Bedwars[`${modePrefix}_entity_attack_deaths_bedwars`] || 0,
            "Fall Damage Deaths": playerData.stats.Bedwars[`${modePrefix}_fall_deaths_bedwars`] || 0,
            "Thorn Deaths": playerData.stats.Bedwars[`${modePrefix}_thorn_deaths_bedwars`] || 0,
            "Final Kills": playerData.stats.Bedwars[`${modePrefix}_final_kills_bedwars`] || 0,
            "Void Final Kills": playerData.stats.Bedwars[`${modePrefix}_void_final_kills_bedwars`] || 0,
            "Mob Final Kills": playerData.stats.Bedwars[`${modePrefix}_entity_attack_final_kills_bedwars`] || 0,
            "Fall Damage Final Kills": playerData.stats.Bedwars[`${modePrefix}_fall_final_kills_bedwars`] || 0,
            "Lava Final Kills": playerData.stats.Bedwars[`${modePrefix}_lava_final_kills_bedwars`] || 0,
            "Thorn Final Kills": playerData.stats.Bedwars[`${modePrefix}_thorn_final_kills_bedwars`] || 0,
            "Final Deaths": playerData.stats.Bedwars[`${modePrefix}_final_deaths_bedwars`] || 0,
            "Void Final Deaths": playerData.stats.Bedwars[`${modePrefix}_void_final_deaths_bedwars`] || 0,
            "Mob Final Deaths": playerData.stats.Bedwars[`${modePrefix}_entity_attack_final_deaths_bedwars`] || 0,
            "Creeper Final Deaths": playerData.stats.Bedwars[`${modePrefix}_entity_explosion_final_deaths_bedwars`] || 0,
            "Placeable beds collected": playerData.stats.Bedwars[`${modePrefix}_bed_resources_collected_bedwars`] || 0,
            "Lava Final Deaths": playerData.stats.Bedwars[`${modePrefix}_lava_final_deaths_bedwars`] || 0,
            "Thorn Final Deaths": playerData.stats.Bedwars[`${modePrefix}_thorn_final_deaths_bedwars`] || 0,
            "magic deaths": playerData.stats.Bedwars[`${modePrefix}_magic_deaths_bedwars`] || 0,
            "block explosion deaths": playerData.stats.Bedwars[`${modePrefix}_block_explosion_deaths_bedwars`] || 0,
        };

        // Format the stats as a string with each stat on a new line
        let statsMessage = `Lucky Block ${gameType} stats for ${playerName}\n\n`;
        for (const [key, value] of Object.entries(luckyBlockStats)) {
            statsMessage += `${key}: ${value}\n`;
        }

        return statsMessage;
    } catch (error) {
        console.error(error);
        if (error.response && error.response.data && error.response.data.cause === 'You have already looked up this name recently') {
            return 'You have already looked up this name recently. Please wait a while before trying again.';
        }
        return `Failed to fetch stats for player ${playerName}.`;
    }
}

// Function to verify Minecraft username from Hypixel API
async function verifyMinecraftUsername(minecraftUsername) {
    const url = `https://api.hypixel.net/player?key=${process.env.HYPIXEL_API_KEY}&name=${minecraftUsername}`;
    try {
        const response = await axios.get(url);
        return response.data.success && response.data.player ? minecraftUsername : null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

// Event listener when the bot is ready
client.once('ready', async () => {
    console.log('Bot is online!');
    try {
        client.user.setActivity("People Open Blocks", {
            type: ActivityType.Watching,
        });
    } catch (error) {
        console.error("Error during bot initialization:", error);
    }

    // Register slash commands
    const commands = [
        {
            name: 'stats',
            description: 'Get Lucky Block stats for a player',
            options: [
                {
                    name: 'gamemode',
                    type: 3, // STRING
                    description: 'The game mode (Duo or Fours)',
                    required: true,
                    choices: [
                        {
                            name: 'Duos',
                            value: 'Duos'
                        },
                        {
                            name: 'Fours',
                            value: 'Fours'
                        }
                    ]
                },
                {
                    name: 'player',
                    type: 3, // STRING
                    description: 'The player name',
                    required: false
                }
            ]
        },
        {
            name: 'link',
            description: 'Link your Hypixel and Discord accounts',
            options: [
                {
                    name: 'minecraft_ign',
                    type: 3, // STRING
                    description: 'Your Minecraft in-game name',
                    required: true
                }
            ]
        }
    ];

    const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_BOT_TOKEN);
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
});

// Event listener for slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options, user } = interaction;

    if (commandName === 'stats') {
        const gameType = options.getString('gamemode');
        let playerName = options.getString('player');

        if (!playerName) {
            if (linkedAccounts[user.id]) {
                playerName = linkedAccounts[user.id];
            } else {
                await interaction.reply('No player specified and no linked account found.');
                return;
            }
        }

        const statsMessage = await getLuckyBlockStats(gameType, playerName);
        if (statsMessage && statsMessage.trim().length > 0) {
            await interaction.reply(statsMessage);
        } else {
            await interaction.reply('No stats available.');
        }
    } else if (commandName === 'link') {
        const minecraftIGN = options.getString('minecraft_ign');
        const verifiedUsername = await verifyMinecraftUsername(minecraftIGN);

        if (verifiedUsername) {
            linkedAccounts[user.id] = verifiedUsername;
            saveLinkedAccounts();
            await interaction.reply(`Your Hypixel account ${verifiedUsername} has been successfully linked.`);
        } else {
            await interaction.reply('Could not verify the Minecraft username. Please make sure it is correct.');
        }
    }
});

// Log in to Discord
client.login(process.env.DISCORD_BOT_TOKEN);