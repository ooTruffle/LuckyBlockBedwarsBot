const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// Register custom fonts if needed
// registerFont('path/to/custom-font.ttf', { family: 'CustomFont' });

async function generateLocalStatsImage(playerName, stats, uuid) {
    const width = 1000;
    const height = 800;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background color
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.fillText(`Stats for ${playerName}`, 50, 50);

    // Colors and styles for stat boxes
    const colors = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'];
    const boxWidth = 400;
    const boxHeight = 80;
    const padding = 20;
    const borderRadius = 10;
    const shadowOffset = 5;
    const startX = 50;
    const startY = 100;

    ctx.font = '24px Arial';
    ctx.textBaseline = 'middle';

    // Stats Array
    const statsArray = [
        `Winstreak: ${stats.Winstreak}`,
        `Games Played: ${stats["Games Played"]}`,
        `Wins: ${stats.Wins}`,
        `Loss: ${stats.Loss}`,
        `Beds Broken: ${stats["Beds Broken"]}`,
        `Beds Lost: ${stats["Beds Lost"]}`,
        `Kills: ${stats.Kills}`,
        `Deaths: ${stats.Deaths}`,
        `Final Kills: ${stats["Final Kills"]}`,
        `Final Deaths: ${stats["Final Deaths"]}`
    ];

    // Draw stats in colored boxes with rounded corners and shadows
    statsArray.forEach((text, index) => {
        const x = startX + (index % 2) * (boxWidth + padding);
        const y = startY + Math.floor(index / 2) * (boxHeight + padding);

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x + shadowOffset, y + shadowOffset, boxWidth, boxHeight);

        // Box
        ctx.fillStyle = colors[index % colors.length];
        ctx.beginPath();
        ctx.moveTo(x + borderRadius, y);
        ctx.lineTo(x + boxWidth - borderRadius, y);
        ctx.quadraticCurveTo(x + boxWidth, y, x + boxWidth, y + borderRadius);
        ctx.lineTo(x + boxWidth, y + boxHeight - borderRadius);
        ctx.quadraticCurveTo(x + boxWidth, y + boxHeight, x + boxWidth - borderRadius, y + boxHeight);
        ctx.lineTo(x + borderRadius, y + boxHeight);
        ctx.quadraticCurveTo(x, y + boxHeight, x, y + boxHeight - borderRadius);
        ctx.lineTo(x, y + borderRadius);
        ctx.quadraticCurveTo(x, y, x + borderRadius, y);
        ctx.closePath();
        ctx.fill();

        // Text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(text, x + 20, y + boxHeight / 2);
    });

    // Add a full Minecraft skin preview
    const skinUrl = `https://crafatar.com/renders/body/${uuid}?scale=10&default=MHF_Steve&overlay`;
    const skinImage = await loadImage(skinUrl);
    ctx.drawImage(skinImage, 800, 150, 150, 300);

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
const uuid = statsData.uuid;
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

generateLocalStatsImage(playerName, stats, uuid);