require("dotenv").config();
const axios = require('axios'); 
const fs = require('fs'); 
const path = require('path'); 
const linkedAccountsFilePath = './linkedAccounts.json';


function loadLinkedAccounts() {
    if (! fs.existsSync(linkedAccountsFilePath)) {
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

        if (response.data.cause) {
            if (response.data.cause === 'Invalid API key') {
                return { error: 'API key needs to be changed' };
            } else if (response.data.cause === 'You have already looked up this name recently') {
                return { error: 'You have already looked up this name recently. Please wait a while before trying again.' };
            } else {
                return { error: `Failed to fetch data: ${response.data.cause}` };
            }
        }

        const playerData = response.data.player;

        // Store the data in cache
        cache[cacheKey] = {
            data: playerData,
            timestamp: now
        };

        return playerData;
    } catch (error) {
        console.error('Error fetching player data:', error.message);
        if (error.response && error.response.data && error.response.data.cause) {
            if (error.response.data.cause === 'Invalid API key') {
                return { error: 'API key needs to be changed' };
            } else if (error.response.data.cause === 'You have already looked up this name recently') {
                return { error: 'You have already looked up this name recently. Please wait a while before trying again.' };
            }
            return { error: `Failed to fetch data: ${error.response.data.cause}` };
        }
        return { error: `Failed to fetch data for player ${playerName}.` };
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

    if (playerData.error) {
        return playerData.error;
    }

    if (! playerData || ! playerData.stats || ! playerData.stats.Bedwars) {
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
    if (! playerData || ! playerData.stats || ! playerData.stats.Bedwars) {
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
module.exports = {
    linkedAccounts,
    saveLinkedAccounts,
    calculateRatios,
    getSimpleLuckyBlockStats,
    getLuckyBlockStats,
    getPlayerUUID,
    verifyMinecraftUsername,
    cache,
    
};

