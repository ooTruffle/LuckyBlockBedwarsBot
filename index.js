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


const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});


const linkedAccountsFilePath = './linkedAccounts.json';


function loadLinkedAccounts() {
    if (!fs.existsSync(linkedAccountsFilePath)) {
        return {};
    }
    const data = fs.readFileSync(linkedAccountsFilePath);
    return JSON.parse(data);
}

let linkedAccounts = loadLinkedAccounts();


function saveLinkedAccounts() {
    fs.writeFileSync(linkedAccountsFilePath, JSON.stringify(linkedAccounts, null, 2));
}


const cache = {};


async function cachePlayerData(playerName) {
    const cacheKey = `playerData-${playerName}`;
    const now = Date.now();

    if (cache[cacheKey] && (now - cache[cacheKey].timestamp < 5 * 60 * 1000)) {
        return cache[cacheKey].data;
    }

    const url = `https://api.hypixel.net/player?key=${process.env.HYPIXEL_API_KEY}&name=${playerName}`;
    try {
        const response = await axios.get(url);

        if (response.data.cause === 'You have already looked up this name recently') {
            return { error: 'You have already looked up this name recently. Please wait a while before trying again.' };
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
        return { error: `Failed to fetch data for player ${playerName}, This could be that the name has been looked up recently` };
    }
}


async function getPlayerUUID(playerName) {
    const playerData = await cachePlayerData(playerName);
    if (playerData && playerData.uuid) {
        return playerData.uuid;
    } else {
        throw new Error(`UUID not found for player ${playerName}`);
    }
}
async function verifyMinecraftUsername(username) {
    const url = `https://api.mojang.com/users/profiles/minecraft/${username}`;
    try {
        const response = await axios.get(url);
        if (response.status === 200) {
            return response.data;
        } else {
            return null;
        }
    } catch (error) {
        console.error(`Failed to verify Minecraft username: ${username}`, error);
        return null;
    }
}


async function getLuckyBlockStats(gameType, playerName) {
    const playerData = await cachePlayerData(playerName);

    // Check if there was an error
    if (playerData.error) {
        return playerData.error;
    }

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
        "Fire Kills": playerData.stats.Bedwars[`${modePrefix}_fire_kills_bedwars`] || 0,
        "Firetick Kills": playerData.stats.Bedwars[`${modePrefix}_fire_tick_kills_bedwars`] || 0,
        "Projectile Kills": playerData.stats.Bedwars[`${modePrefix}_projectile_kills_bedwars`] || 0,
        "Magic Kills": playerData.stats.Bedwars[`${modePrefix}_magic_kills_bedwars`] || 0,
        "Deaths": playerData.stats.Bedwars[`${modePrefix}_deaths_bedwars`] || 0,
        "Void Deaths": playerData.stats.Bedwars[`${modePrefix}_void_deaths_bedwars`] || 0,
        "Mob Deaths": playerData.stats.Bedwars[`${modePrefix}_entity_attack_deaths_bedwars`] || 0,
        "Fall Damage Deaths": playerData.stats.Bedwars[`${modePrefix}_fall_deaths_bedwars`] || 0,
        "Thorn Deaths": playerData.stats.Bedwars[`${modePrefix}_thorns_deaths_bedwars`] || 0,
        "Suffocation Deaths": playerData.stats.Bedwars[`${modePrefix}_suffocation_deaths_bedwars`] || 0,
        "Block Explosion Deaths": playerData.stats.Bedwars[`${modePrefix}_block_explosion_deaths_bedwars`] || 0,
        "Wither Deaths": playerData.stats.Bedwars[`${modePrefix}_wither_deaths_bedwars`] || 0,
        "lava Deaths": playerData.stats.Bedwars[`${modePrefix}_lava_deaths_bedwars`] || 0,
        "Crepper Deaths": playerData.stats.Bedwars[`${modePrefix}_entity_explosion_deaths_bedwars`] || 0,
        "Magic Deaths": playerData.stats.Bedwars[`${modePrefix}_magic_deaths_bedwars`] || 0,
        "Fire Tick Deaths": playerData.stats.Bedwars[`${modePrefix}_fire_tick_deaths_bedwars`] || 0,
        "Fire Deaths": playerData.stats.Bedwars[`${modePrefix}_fire_deaths_bedwars`] || 0,
        "Projectile Deaths": playerData.stats.Bedwars[`${modePrefix}_projectile_deaths_bedwars`] || 0,
        "Final Kills": playerData.stats.Bedwars[`${modePrefix}_final_kills_bedwars`] || 0,
        "Void Final Kills": playerData.stats.Bedwars[`${modePrefix}_void_final_kills_bedwars`] || 0,
        "Mob Final Kills": playerData.stats.Bedwars[`${modePrefix}_entity_attack_final_kills_bedwars`] || 0,
        "Fall Damage Final Kills": playerData.stats.Bedwars[`${modePrefix}_fall_final_kills_bedwars`] || 0,
        "Lava Final Kills": playerData.stats.Bedwars[`${modePrefix}_lava_final_kills_bedwars`] || 0,
        "Thorn Final Kills": playerData.stats.Bedwars[`${modePrefix}_thorns_final_kills_bedwars`] || 0,
        "Firetick Final Kills": playerData.stats.Bedwars[`${modePrefix}_fire_tick_final_kills_bedwars`] || 0,
        "Magic Final Kills": playerData.stats.Bedwars[`${modePrefix}_magic_final_kills_bedwars`] || 0,
        "Creeper Final Kills": playerData.stats.Bedwars[`${modePrefix}_entity_explosion_final_kills_bedwars`] || 0,
        "Final Deaths": playerData.stats.Bedwars[`${modePrefix}_final_deaths_bedwars`] || 0,
        "Void Final Deaths": playerData.stats.Bedwars[`${modePrefix}_void_final_deaths_bedwars`] || 0,
        "Mob Final Deaths": playerData.stats.Bedwars[`${modePrefix}_entity_attack_final_deaths_bedwars`] || 0,
        "Creeper Final Deaths": playerData.stats.Bedwars[`${modePrefix}_entity_explosion_final_deaths_bedwars`] || 0,
        "Fall Damage Final Deaths": playerData.stats.Bedwars[`${modePrefix}_fall_final_deaths_bedwars`] || 0,
        "Lava Final Deaths": playerData.stats.Bedwars[`${modePrefix}_lava_final_deaths_bedwars`] || 0,
        "Thorn Final Deaths": playerData.stats.Bedwars[`${modePrefix}_thorns_final_deaths_bedwars`] || 0,
        "Magic Final Deaths": playerData.stats.Bedwars[`${modePrefix}_magic_final_deaths_bedwars`] || 0,
        "Suffocation Final Deaths": playerData.stats.Bedwars[`${modePrefix}_suffocation_final_deaths_bedwars`] || 0,
        "Wither Final Deaths": playerData.stats.Bedwars[`${modePrefix}_wither_final_deaths_bedwars`] || 0,
        "Fire Tick Final Deaths": playerData.stats.Bedwars[`${modePrefix}_fire_tick_final_deaths_bedwars`] || 0,
        "Block Explosion Final Deaths": playerData.stats.Bedwars[`${modePrefix}_block_explosion_final_deaths_bedwars`] || 0,
        "Projectile Final Deaths": playerData.stats.Bedwars[`${modePrefix}_projectile_final_deaths_bedwars`] || 0,
        "Placeable beds collected": playerData.stats.Bedwars[`${modePrefix}_bed_resources_collected_bedwars`] || 0,
        "Magic Deaths": playerData.stats.Bedwars[`${modePrefix}_magic_deaths_bedwars`] || 0,
        "Block Explosion Deaths": playerData.stats.Bedwars[`${modePrefix}_block_explosion_deaths_bedwars`] || 0,
        "Falling Block Deaths": playerData.stats.Bedwars[`${modePrefix}_falling_block_deaths_bedwars`] || 0,
        "Falling Block Final Deaths": playerData.stats.Bedwars[`${modePrefix}_falling_block_final_deaths_bedwars`] || 0
    };

    return luckyBlockStats;
}


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




client.once('ready', async () => {
    console.log('Bot is online!');
    try {
        
        client.user.setActivity("People Open Blocks", { type: ActivityType.Watching });

       
        const statuses = [
            { name: "People getting Rouletted", type: ActivityType.Watching },
            { name: "People Open Blocks", type: ActivityType.Watching },
            { name: "Lucky Block Bedwars", type: ActivityType.Playing },
            
        ];

        
        let statusIndex = 0;
        setInterval(() => {
            statusIndex = (statusIndex + 1) % statuses.length;
            client.user.setActivity(statuses[statusIndex].name, { type: statuses[statusIndex].type });
        }, 300000); 
    } catch (error) {
        console.error("Error during bot initialization:", error);
    }
});


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
    
        if (stats.error) {
            await interaction.reply(stats.error);
            return;
        }

        const uuid = await getPlayerUUID(playerName);
        
        // Cache the stats
        cache[`stats-${playerName}`] = stats;
    
        const statsEmbed = new EmbedBuilder()
            .setColor(`#e4ff00`)
            .setTitle(`Stats in Lucky Block ${gameType} for ${playerName}`)
            .addFields(
                { name: 'Basic Stats', value: `
                    Winstreak: ${stats.Winstreak}
                    Games Played: ${stats["Games Played"]}
                    Wins: ${stats.Wins}
                    Loss: ${stats.Loss}
                    Beds Broken: ${stats["Beds Broken"]}
                    Beds Lost: ${stats["Beds Lost"]}
                    Placeable beds collected: ${stats["Placeable beds collected"]}
                ` , inline: true},
                { name: 'Kill Stats', value: `
                    Kills: ${stats.Kills}
                    Fall Damage Kills: ${stats["Fall Damage Kills"]}
                    Void Kills: ${stats["Void Kills"]}
                    Mob Kills: ${stats["Mob Kills"]}
                    Creeper Kills: ${stats["Creeper Kills"]}
                    Thorn Kills: ${stats["Thorn Kills"]}
                    Fire Kills: ${stats["Fire Kills"]}
                    Firetick Kills: ${stats["Firetick Kills"]}
                    Projectile Kills: ${stats["Projectile Kills"]}
                    Magic Kills: ${stats["Magic Kills"]}
                ` , inline: true},
                { name: 'Death Stats', value: `
                    Deaths: ${stats.Deaths}
                    Void Deaths: ${stats["Void Deaths"]}
                    Mob Deaths: ${stats["Mob Deaths"]}
                    Creeper Deaths: ${stats["Crepper Deaths"]}
                    Fall Damage Deaths: ${stats["Fall Damage Deaths"]}
                    Thorn Deaths: ${stats["Thorn Deaths"]}
                    Magic Deaths: ${stats["Magic Deaths"]}
                    Wither Deaths: ${stats["Wither Deaths"]}
                    Suffocation Deaths: ${stats["Suffocation Deaths"]}
                    Block Explosion Deaths: ${stats["Block Explosion Deaths"]}
                    Fire Deaths: ${stats["Fire Deaths"]}
                    Fire Tick Deaths: ${stats["Fire Tick Deaths"]}
                    Lava Deaths: ${stats["lava Deaths"]}
                    Projectile Deaths: ${stats["Projectile Deaths"]}
                    Falling Block Deaths: ${stats["Falling Block Deaths"]}
                `, inline: true},
                {
                    name: '\u200b',
                    value: '\u200b',
                    inline: false,
                },
                { name: 'Final Kill Stats', value: `
                    Final Kills: ${stats["Final Kills"]}
                    Void Final Kills: ${stats["Void Final Kills"]}
                    Mob Final Kills: ${stats["Mob Final Kills"]}
                    Fall Damage Final Kills: ${stats["Fall Damage Final Kills"]}
                    Lava Final Kills: ${stats["Lava Final Kills"]}
                    Thorn Final Kills: ${stats["Thorn Final Kills"]}
                    Firetick Final Kills: ${stats["Firetick Final Kills"]}
                    Magic Final Kills: ${stats["Magic Final Kills"]}
                    Creeper Final Kills: ${stats["Creeper Final Kills"]}
                `, inline: true},
                { name: 'Final Death Stats', value: `
                    Final Deaths: ${stats["Final Deaths"]}
                    Void Final Deaths: ${stats["Void Final Deaths"]}
                    Mob Final Deaths: ${stats["Mob Final Deaths"]}
                    Creeper Final Deaths: ${stats["Creeper Final Deaths"]}
                    Fall Damage Final Deaths: ${stats["Fall Damage Final Deaths"]}
                    Lava Final Deaths: ${stats["Lava Final Deaths"]}
                    Thorn Final Deaths: ${stats["Thorn Final Deaths"]}
                    Magic Final Deaths: ${stats["Magic Final Deaths"]}
                    Suffocation Final Deaths: ${stats["Suffocation Final Deaths"]}
                    Wither Final Deaths: ${stats["Wither Final Deaths"]}
                    Fire Tick Final Deaths: ${stats["Fire Tick Final Deaths"]}
                    Block Explosion Final Deaths: ${stats["Block Explosion Final Deaths"]}
                    Projectile Final Deaths: ${stats["Projectile Final Deaths"]}
                    Falling Block Final Deaths: ${stats["Falling Block Final Deaths"]}
                `, inline: true}
            )
            .setTimestamp()
            .setFooter({ text: `${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setThumbnail(`https://minotar.net/helm/${uuid}.png`);

        await interaction.reply({ embeds: [statsEmbed] });
    } else if (commandName === 'link') {
        const minecraftIGN = options.getString('minecraft_ign');
        const verifiedUsername = await verifyMinecraftUsername(minecraftIGN);

        if (verifiedUsername) {
            linkedAccounts[user.id] = minecraftIGN;
            saveLinkedAccounts();
            await interaction.reply(`Your Hypixel account ${minecraftIGN} has been successfully linked.`);
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
            const uuid = await getPlayerUUID(playerName);

            // Use cached stats if available
            let stats = cache[`stats-${playerName}`];
            if (!stats) {
                stats = await getLuckyBlockStats(gameType, playerName);
                if (typeof stats === 'string') {
                    await interaction.reply(stats);
                    return;
                }
                // Cache the stats
                cache[`stats-${playerName}`] = stats;
            }

            const ratios = calculateRatios(stats);
            const ratioEmbed = new EmbedBuilder()
                .setColor(`#e4ff00`)
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

        const uuid = await getPlayerUUID(playerName);

        const simpleStatsEmbed = new EmbedBuilder()
            .setColor(`#e4ff00`)
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
            const uuid = await getPlayerUUID(playerName);

            const stats = await getLuckyBlockStats(gameType, playerName);
            if (typeof stats === 'string') {
                await interaction.reply(stats);
                return;
            }

            const ratios = calculateRatios(stats);
            const ratioEmbed = new EmbedBuilder()
                .setColor(`#e4ff00`)
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


const uuid = await getPlayerUUID(playerName);


const simpleStatsEmbed = new EmbedBuilder()
    .setColor(`#e4ff00`)
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

client.login(process.env.DISCORD_BOT_TOKEN);