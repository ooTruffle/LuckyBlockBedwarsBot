const {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    ActivityType,
    InteractionType
} = require('discord.js');
const axios = require('axios');
const fs = require('fs');
require("dotenv").config();

// Create a new Discord client
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

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

// In-memory cache for Hypixel API responses
const cache = {};

// Function to get Lucky Block stats from Hypixel API
async function getLuckyBlockStats(gameType, playerName) {
    const cacheKey = `${gameType}-${playerName}`;
    const now = Date.now();

    // Check if the data is in cache and is less than 5 minutes old
    if (cache[cacheKey] && (now - cache[cacheKey].timestamp < 5 * 60 * 1000)) {
        return cache[cacheKey].data;
    }

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
            "Thorn Kills": playerData.stats.Bedwars[`${modePrefix}_thorns_kills_bedwars`] || 0,
            "Deaths": playerData.stats.Bedwars[`${modePrefix}_deaths_bedwars`] || 0,
            "Void Deaths": playerData.stats.Bedwars[`${modePrefix}_void_deaths_bedwars`] || 0,
            "Mob Deaths": playerData.stats.Bedwars[`${modePrefix}_entity_attack_deaths_bedwars`] || 0,
            "Fall Damage Deaths": playerData.stats.Bedwars[`${modePrefix}_fall_deaths_bedwars`] || 0,
            "Thorn Deaths": playerData.stats.Bedwars[`${modePrefix}_thorns_deaths_bedwars`] || 0,
            "Final Kills": playerData.stats.Bedwars[`${modePrefix}_final_kills_bedwars`] || 0,
            "Void Final Kills": playerData.stats.Bedwars[`${modePrefix}_void_final_kills_bedwars`] || 0,
            "Mob Final Kills": playerData.stats.Bedwars[`${modePrefix}_entity_attack_final_kills_bedwars`] || 0,
            "Fall Damage Final Kills": playerData.stats.Bedwars[`${modePrefix}_fall_final_kills_bedwars`] || 0,
            "Lava Final Kills": playerData.stats.Bedwars[`${modePrefix}_lava_final_kills_bedwars`] || 0,
            "Thorn Final Kills": playerData.stats.Bedwars[`${modePrefix}_thorns_final_kills_bedwars`] || 0,
            "Final Deaths": playerData.stats.Bedwars[`${modePrefix}_final_deaths_bedwars`] || 0,
            "Void Final Deaths": playerData.stats.Bedwars[`${modePrefix}_void_final_deaths_bedwars`] || 0,
            "Mob Final Deaths": playerData.stats.Bedwars[`${modePrefix}_entity_attack_final_deaths_bedwars`] || 0,
            "Creeper Final Deaths": playerData.stats.Bedwars[`${modePrefix}_entity_explosion_final_deaths_bedwars`] || 0,
            "Lava Final Deaths": playerData.stats.Bedwars[`${modePrefix}_lava_final_deaths_bedwars`] || 0,
            "Thorn Final Deaths": playerData.stats.Bedwars[`${modePrefix}_thorns_final_deaths_bedwars`] || 0,
            "Placeable beds collected": playerData.stats.Bedwars[`${modePrefix}_bed_resources_collected_bedwars`] || 0,
            "Magic Deaths": playerData.stats.Bedwars[`${modePrefix}_magic_deaths_bedwars`] || 0,
            "Block Explosion Deaths": playerData.stats.Bedwars[`${modePrefix}_block_explosion_deaths_bedwars`] || 0,
            "Falling Block Deaths": playerData.stats.Bedwars[`${modePrefix}_falling_block_deaths_bedwars`] || 0,
            "Falling Block Final Deaths": playerData.stats.Bedwars[`${modePrefix}_falling_block_final_deaths_bedwars`] || 0
        };

        // Store the data in cache
        cache[cacheKey] = {
            data: luckyBlockStats,
            timestamp: now
        };

        return luckyBlockStats;
    } catch (error) {
        console.error(error);
        if (error.response && error.response.data && error.response.data.cause === 'You have already looked up this name recently') {
            return 'You have already looked up this name recently. Please wait a while before trying again.';
        }
        return `Failed to fetch stats for player ${playerName}.`;
    }
}

// Function to get Lucky Block stats from Hypixel API
async function getLuckyBlockStats(gameType, playerName, simplified = false) {
    const cacheKey = `${gameType}-${playerName}`;
    const now = Date.now();

    // Check if the data is in cache and is less than 5 minutes old
    if (cache[cacheKey] && (now - cache[cacheKey].timestamp < 5 * 60 * 1000)) {
        return cache[cacheKey].data;
    }

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
            "Deaths": playerData.stats.Bedwars[`${modePrefix}_deaths_bedwars`] || 0,
            "Final Kills": playerData.stats.Bedwars[`${modePrefix}_final_kills_bedwars`] || 0,
            "Final Deaths": playerData.stats.Bedwars[`${modePrefix}_final_deaths_bedwars`] || 0
        };

        if (!simplified) {
            Object.assign(luckyBlockStats, {
                "Fall Damage Kills": playerData.stats.Bedwars[`${modePrefix}_fall_kills_bedwars`] || 0,
                "Void Kills": playerData.stats.Bedwars[`${modePrefix}_void_kills_bedwars`] || 0,
                "Mob Kills": playerData.stats.Bedwars[`${modePrefix}_entity_attack_kills_bedwars`] || 0,
                "Creeper Kills": playerData.stats.Bedwars[`${modePrefix}_entity_explosion_kills_bedwars`] || 0,
                "Thorn Kills": playerData.stats.Bedwars[`${modePrefix}_thorns_kills_bedwars`] || 0,
                "Void Deaths": playerData.stats.Bedwars[`${modePrefix}_void_deaths_bedwars`] || 0,
                "Mob Deaths": playerData.stats.Bedwars[`${modePrefix}_entity_attack_deaths_bedwars`] || 0,
                "Fall Damage Deaths": playerData.stats.Bedwars[`${modePrefix}_fall_deaths_bedwars`] || 0,
                "Thorn Deaths": playerData.stats.Bedwars[`${modePrefix}_thorns_deaths_bedwars`] || 0,
                "Void Final Kills": playerData.stats.Bedwars[`${modePrefix}_void_final_kills_bedwars`] || 0,
                "Mob Final Kills": playerData.stats.Bedwars[`${modePrefix}_entity_attack_final_kills_bedwars`] || 0,
                "Fall Damage Final Kills": playerData.stats.Bedwars[`${modePrefix}_fall_final_kills_bedwars`] || 0,
                "Lava Final Kills": playerData.stats.Bedwars[`${modePrefix}_lava_final_kills_bedwars`] || 0,
                "Thorn Final Kills": playerData.stats.Bedwars[`${modePrefix}_thorns_final_kills_bedwars`] || 0,
                "Void Final Deaths": playerData.stats.Bedwars[`${modePrefix}_void_final_deaths_bedwars`] || 0,
                "Mob Final Deaths": playerData.stats.Bedwars[`${modePrefix}_entity_attack_final_deaths_bedwars`] || 0,
                "Creeper Final Deaths": playerData.stats.Bedwars[`${modePrefix}_entity_explosion_final_deaths_bedwars`] || 0,
                "Lava Final Deaths": playerData.stats.Bedwars[`${modePrefix}_lava_final_deaths_bedwars`] || 0,
                "Thorn Final Deaths": playerData.stats.Bedwars[`${modePrefix}_thorns_final_deaths_bedwars`] || 0,
                "Placeable beds collected": playerData.stats.Bedwars[`${modePrefix}_bed_resources_collected_bedwars`] || 0,
                "Magic Deaths": playerData.stats.Bedwars[`${modePrefix}_magic_deaths_bedwars`] || 0,
                "Block Explosion Deaths": playerData.stats.Bedwars[`${modePrefix}_block_explosion_deaths_bedwars`] || 0,
                "Falling Block Deaths": playerData.stats.Bedwars[`${modePrefix}_falling_block_deaths_bedwars`] || 0,
                "Falling Block Final Deaths": playerData.stats.Bedwars[`${modePrefix}_falling_block_final_deaths_bedwars`] || 0
            });
        }

        // Store the data in cache
        cache[cacheKey] = {
            data: luckyBlockStats,
            timestamp: now
        };

        return luckyBlockStats;
    } catch (error) {
        console.error(error);
        if (error.response && error.response.data && error.response.data.cause === 'You have already looked up this name recently') {
            return 'You have already looked up this name recently. Please wait a while before trying again.';
        }
        return `Failed to fetch stats for player ${playerName}.`;
    }
}
// Function to calculate ratios
function calculateRatios(stats) {
    const winLossRatio = stats.Wins / (stats.Loss || 1);
    const killDeathRatio = stats.Kills / (stats.Deaths || 1);
    const finalKillDeathRatio = stats['Final Kills'] / (stats['Final Deaths'] || 1);

    return {
        winLossRatio,
        killDeathRatio,
        finalKillDeathRatio
    };
}

// Event listener when the bot is ready
client.once('ready', async () => {
    console.log('Bot is online!');
    try {
        client.user.setActivity("People Open Blocks", { type: ActivityType.Watching });
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
                description: 'The game mode (Duos or Fours)',
                required: true,
                choices: [
                    {
                        name: 'Duos',
                        value: 'Duos'
                    }, {
                        name: 'Fours',
                        value: 'Fours'
                    }
                ]
            }, {
                name: 'player',
                type: 3, // STRING
                description: 'The player name',
                required: false
            }
        ]
    }, {
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
    }, {
        name: 'ratios',
        description: 'Get Win/Loss, Kill/Death, Final Kill/Final Death ratios for a player',
        options: [
            {
                name: 'gamemode',
                type: 3, // STRING
                description: 'The game mode (Duos or Fours)',
                required: true,
                choices: [
                    {
                        name: 'Duos',
                        value: 'Duos'
                    }, {
                        name: 'Fours',
                        value: 'Fours'
                    }
                ]
            }, {
                name: 'player',
                type: 3, // STRING
                description: 'The player name',
                required: false
            }
        ]
    }, {
        name: 'simplestats',
        description: 'Get simplified Lucky Block stats for a player',
        options: [
            {
                name: 'gamemode',
                type: 3, // STRING
                description: 'The game mode (Duos or Fours)',
                required: true,
                choices: [
                    {
                        name: 'Duos',
                        value: 'Duos'
                    }, {
                        name: 'Fours',
                        value: 'Fours'
                    }
                ]
            }, {
                name: 'player',
                type: 3, // STRING
                description: 'The player name',
                required: false
            }
        ]
    }
];

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_BOT_TOKEN);
try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log('Successfully reloaded application (/) commands.');
} catch (error) {
    console.error(error);
}
});

// Event listener for slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand())
        return;

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
    } else if (commandName === 'ratios') {
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

        const stats = await getLuckyBlockStats(gameType, playerName);
        if (typeof stats === 'string') {
            await interaction.reply(stats);
            return;
        }

        const ratios = calculateRatios(stats);
        const ratioMessage = `Ratios for ${playerName} in Lucky Block ${gameType}:\n\n` +
            `Win/Loss Ratio: ${ratios.winLossRatio.toFixed(2)}\n` +
            `Kill/Death Ratio: ${ratios.killDeathRatio.toFixed(2)}\n` +
            `Final Kill/Final Death Ratio: ${ratios.finalKillDeathRatio.toFixed(2)}`;

        await interaction.reply(ratioMessage);
    } else if (commandName === 'simplestats') {
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

        const stats = await getLuckyBlockStats(gameType, playerName, true);
        if (typeof stats === 'string') {
            await interaction.reply(stats);
            return;
        }

        const simpleStatsMessage = `Simple stats for ${playerName} in Lucky Block ${gameType}:\n\n` +
            `Winstreak: ${stats.Winstreak}\n` +
            `Games Played: ${stats["Games Played"]}\n` +
            `Wins: ${stats.Wins}\n` +
            `Loss: ${stats.Loss}\n` +
            `Beds Broken: ${stats["Beds Broken"]}\n` +
            `Beds Lost: ${stats["Beds Lost"]}\n` +
            `Kills: ${stats.Kills}\n` +
            `Deaths: ${stats.Deaths}\n` +
            `Final Kills: ${stats["Final Kills"]}\n` +
            `Final Deaths: ${stats["Final Deaths"]}`;

        await interaction.reply(simpleStatsMessage);
    }
});

// Log in to Discord
client.login(process.env.DISCORD_BOT_TOKEN);