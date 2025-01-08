const {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    ActivityType,
    InteractionType,
    EmbedBuilder ,
    ButtonBuilder,
     ActionRowBuilder
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

// Function to cache player data
async function cachePlayerData(playerName) {
    const cacheKey = `playerData-${playerName}`;
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

        // Store the data in cache
        cache[cacheKey] = {
            data: playerData,
            timestamp: now
        };

        return playerData;
    } catch (error) {
        console.error(error);
        throw new Error(`Failed to fetch data for player ${playerName}`);
    }
}

// Function to get the UUID of a Minecraft player
async function getPlayerUUID(playerName) {
    const playerData = await cachePlayerData(playerName);
    if (playerData && playerData.uuid) {
        return playerData.uuid;
    } else {
        throw new Error(`UUID not found for player ${playerName}`);
    }
}

// Function to get Lucky Block stats from Hypixel API
async function getLuckyBlockStats(gameType, playerName) {
    const playerData = await cachePlayerData(playerName);
    if (!playerData || !playerData.stats || !playerData.stats.Bedwars) {
        return `Player ${playerName} not found or no Bedwars stats available.`;
    }

    const modePrefix = gameType === 'Duos' ? 'eight_two_lucky' : 'four_four_lucky';

    const luckyBlockStats = {
        "Winstreak": playerData.stats.Bedwars[`${modePrefix}_winstreak`] || `?`,
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

    return luckyBlockStats;
}

// Function to get simplified Lucky Block stats from Hypixel API
async function getSimpleLuckyBlockStats(gameType, playerName) {
    const playerData = await cachePlayerData(playerName);
    if (!playerData || !playerData.stats || !playerData.stats.Bedwars) {
        return `Player ${playerName} not found or no Bedwars stats available.`;
    }

    const modePrefix = gameType === 'Duos' ? 'eight_two_lucky' : 'four_four_lucky';

    const simpleLuckyBlockStats = {
        "Winstreak": playerData.stats.Bedwars[`${modePrefix}_winstreak`] || `?`,
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

    return simpleLuckyBlockStats;
}

// Function to calculate ratios
function calculateRatios(stats) {
    const winLossRatio = stats.Wins / (stats.Loss || 1);
    const killDeathRatio = stats.Kills / (stats.Deaths || 1);
    const finalKillDeathRatio = stats['Final Kills'] / (stats['Final Deaths'] || 1);
    const VoidKillRatio = stats['Void Kills'] / (stats['Void Deaths'] || 1);
    const VoidFinalKillRatio = stats['Void Final Deaths'] / (stats['Void Final Deaths'] || 1);

    return {
        winLossRatio,
        killDeathRatio,
        finalKillDeathRatio,
        VoidKillRatio,
        VoidFinalKillRatio
    };
}

// Function to format stats as a string
function formatStats(gameMode, ign, stats) {
    let formattedStats = `Stats in Lucky Block ${gameMode} for ${ign}:\n\n`;
    for (const [key, value] of Object.entries(stats)) {
        formattedStats += `${key}: ${value}\n`;
    }
    return formattedStats.trim();
}


// Event listener when the bot is ready
client.once('ready', async () => {
    console.log('Bot is online!');
    try {
        // Set initial status
        client.user.setActivity("People Open Blocks", { type: ActivityType.Watching });

        // Define an array of statuses
        const statuses = [
            { name: "People getting Rouletted", type: ActivityType.Watching },
            { name: "People Open Blocks", type: ActivityType.Watching },
            { name: "Lucky Block Bedwars", type: ActivityType.Playing },
            
        ];

        // Set interval to change status every 10 minutes (600000 ms)
        let statusIndex = 0;
        setInterval(() => {
            statusIndex = (statusIndex + 1) % statuses.length;
            client.user.setActivity(statuses[statusIndex].name, { type: statuses[statusIndex].type });
        }, 300000); // 10 minutes in milliseconds
    } catch (error) {
        console.error("Error during bot initialization:", error);
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
    
        const stats = await getLuckyBlockStats(gameType, playerName);
        if (typeof stats === 'string') {
            await interaction.reply(stats);
            return;
        }
    
        // Fetch the UUID of the player
        const uuid = await getPlayerUUID(playerName);
    
        // Create an embed message
        const statsEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(`Stats in Lucky Block ${gameType} for ${playerName}`)
            .setDescription(Object.entries(stats).map(([key, value]) => `${key}: ${value}`).join('\n'))
            .setTimestamp()
            .setFooter({ text: `${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setThumbnail(`https://minotar.net/helm/${uuid}.png`);
    
        await interaction.reply({ embeds: [statsEmbed] });
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

        try {
            // Fetch the UUID of the player
            const uuid = await getPlayerUUID(playerName);

            const stats = await getLuckyBlockStats(gameType, playerName);
            if (typeof stats === 'string') {
                await interaction.reply(stats);
                return;
            }

            const ratios = calculateRatios(stats);
            // Create an embed message
            const ratioEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(`Ratios for ${playerName} in Lucky Block ${gameType}`)
                .addFields(
                    { name: 'Win/Loss', value: ratios.winLossRatio.toFixed(2), inline: true },
                    { name: 'Kill/Death', value: ratios.killDeathRatio.toFixed(2), inline: true },
                    { name: 'Final Kill/Final Death', value: ratios.finalKillDeathRatio.toFixed(2), inline: true },
                    { name: 'Void Kill/Death', value: ratios.VoidKillRatio.toFixed(2), inline: true },
                    { name: 'Void Final Kill/Death', value: ratios.VoidFinalKillRatio.toFixed(2), inline: true }
                )
                .setTimestamp()
                .setFooter({ text: `${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setThumbnail(`https://minotar.net/helm/${uuid}.png`);

            await interaction.reply({ embeds: [ratioEmbed] });
        } catch (error) {
            await interaction.reply(`Failed to fetch player UUID for ${playerName}.`);
        }
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

        const stats = await getSimpleLuckyBlockStats(gameType, playerName);
if (typeof stats === 'string') {
    await interaction.reply(stats);
    return;
}

// Fetch the UUID of the player
const uuid = await getPlayerUUID(playerName);

// Create an embed message
const simpleStatsEmbed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`Simple stats for ${playerName} in Lucky Block ${gameType}`)
    .addFields(
        { name: 'Winstreak', value: stats.Winstreak.toString(), inline: true },
        { name: 'Games Played', value: stats["Games Played"].toString(), inline: true },
        { name: 'Wins', value: stats.Wins.toString(), inline: true },
        { name: 'Loss', value: stats.Loss.toString(), inline: true },
        { name: 'Beds Broken', value: stats["Beds Broken"].toString(), inline: true },
        { name: 'Beds Lost', value: stats["Beds Lost"].toString(), inline: true },
        { name: 'Kills', value: stats.Kills.toString(), inline: true },
        { name: 'Deaths', value: stats.Deaths.toString(), inline: true },
        { name: 'Final Kills', value: stats["Final Kills"].toString(), inline: true },
        { name: 'Final Deaths', value: stats["Final Deaths"].toString(), inline: true }
    )
    .setTimestamp()
    .setFooter({ text: `${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
    .setThumbnail(`https://minotar.net/helm/${uuid}.png`);

await interaction.reply({ embeds: [simpleStatsEmbed] });
    } else if (commandName === `info`) {
        const user = await client.users.fetch(`781305692371157034`);
        const  avatarURL = user.displayAvatarURL({ format: 'png', dynamic: true });
        const info = new EmbedBuilder()
        .setColor(`#8000ff`)
        .setTitle(`Lucky Block Bedwars Bot`)
        .setDescription(`This bot was designed and created by ooTruffle to fit the gap of no public bot doing this.`)
        .setThumbnail(avatarURL)

        const githubButton = new ButtonBuilder()
        .setLabel('GitHub Repo')
        .setStyle('Link')
        .setURL('https://github.com/ooTruffle/LuckyBlockBedwarsBot');
    
        const row = new ActionRowBuilder()
          .addComponents(githubButton);
    

        await interaction.reply({ embeds: [info], components: [row]  });
    }

});

// Log in to Discord
client.login(process.env.DISCORD_BOT_TOKEN);