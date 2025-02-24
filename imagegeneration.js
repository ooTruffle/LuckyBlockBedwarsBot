const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

async function generateLocalStatsImage(playerName, stats) {
    const width = 800;
    const height = 600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background color
    ctx.fillStyle = '#2c2f33'; 
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#ffffff'; 
    ctx.font = 'bold 30px Sans';
    ctx.fillText(`Stats for ${playerName}`, 50, 50);

    // Stats
    ctx.font = '20px Sans';
    ctx.fillText(`Winstreak: ${stats.Winstreak}`, 50, 100);
    ctx.fillText(`Games Played: ${stats["Games Played"]}`, 50, 130);
    ctx.fillText(`Wins: ${stats.Wins}`, 50, 160);
    ctx.fillText(`Loss: ${stats.Loss}`, 50, 190);
    ctx.fillText(`Beds Broken: ${stats["Beds Broken"]}`, 50, 220);
    ctx.fillText(`Beds Lost: ${stats["Beds Lost"]}`, 50, 250);
    ctx.fillText(`Kills: ${stats.Kills}`, 50, 280);
    ctx.fillText(`Deaths: ${stats.Deaths}`, 50, 310);
    ctx.fillText(`Final Kills: ${stats["Final Kills"]}`, 50, 340);
    ctx.fillText(`Final Deaths: ${stats["Final Deaths"]}`, 50, 370);

    // Add more stats as needed

    // Convert the canvas to a buffer
    const buffer = canvas.toBuffer('image/png');

    // Save the image to a file
    const imagePath = path.join(__dirname, 'images', `${playerName}_stats.png`);
    fs.writeFileSync(imagePath, buffer);

    console.log(`Image saved to ${imagePath}`);
}

// Read stats from a local JSON file
const statsFilePath = path.join(__dirname, 'player_data_ooTruffle.json');
const statsData = JSON.parse(fs.readFileSync(statsFilePath, 'utf8'));

// Example usage with data from the JSON file
const playerName = statsData.displayname;
const stats = {
    "Winstreak": statsData.stats.Bedwars.winstreak || 0,
    "Games Played": statsData.stats.Bedwars.games_played_bedwars || 0,
    "Wins": statsData.stats.Bedwars.wins_bedwars || 0,
    "Loss": statsData.stats.Bedwars.losses_bedwars || 0,
    "Beds Broken": statsData.stats.Bedwars.beds_broken_bedwars || 0,
    "Beds Lost": statsData.stats.Bedwars.beds_lost_bedwars || 0,
    "Kills": statsData.stats.Bedwars.kills_bedwars || 0,
    "Deaths": statsData.stats.Bedwars.deaths_bedwars || 0,
    "Final Kills": statsData.stats.Bedwars.final_kills_bedwars || 0,
    "Final Deaths": statsData.stats.Bedwars.final_deaths_bedwars || 0
};

generateLocalStatsImage(playerName, stats);