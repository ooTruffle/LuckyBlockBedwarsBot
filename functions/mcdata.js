require("dotenv").config();
const axios = require('axios'); 
const { cachePlayerData } = require('../functions/lbbedwars');

async function getPlayerUUID(playerName) {
    const playerData = await cachePlayerData(playerName);
    if (playerData && playerData.uuid) {
        return playerData.uuid; // Return only the UUID string
    } else {
        throw new Error(`UUID not found for player ${playerName}`);
    }
}

async function getPlayerSocials(playerName) {
    const playerData = await cachePlayerData(playerName);
    if (playerData && playerData.uuid) {
        return playerData.socialMedia;
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
module.exports = {
    getPlayerUUID,
    verifyMinecraftUsername,
    getPlayerSocials
};