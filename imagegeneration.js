const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// Register custom fonts if needed
// registerFont('path/to/custom-font.ttf', { family: 'CustomFont' });

// Utility function to draw rounded rectangles
function fillRoundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

async function generateLocalStatsImage(playerName, stats, uuid) {
    const width = 900;
    const height = 600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background color
    ctx.fillStyle = '#2e2e2e';
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.fillText(`Bedwars Stats for ${playerName}`, 50, 40);

    // Colors and styles for stat boxes
    const colors = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'];
    const boxWidth = 250;
    const boxHeight = 70;
    const padding = 15;
    const borderRadius = 10;
    const shadowOffset = 5;
    const startX = 50;
    const startY = 100;

    ctx.font = 'bold 20px Arial';
    ctx.textBaseline = 'middle';

    // Stats Array
    const statsArray = [
        { name: "Winstreak", value: stats.Winstreak },
        { name: "Games Played", value: stats["Games Played"] },
        { name: "Wins", value: stats.Wins },
        { name: "Losses", value: stats.Loss },
        { name: "W/L Ratio", value: (stats.Wins / stats.Loss).toFixed(2) },
        { name: "Final Kills", value: stats["Final Kills"] },
        { name: "Final Deaths", value: stats["Final Deaths"] },
        { name: "FKDR", value: (stats["Final Kills"] / stats["Final Deaths"]).toFixed(2) }
    ];

    // Layout positions for 3 columns
    const layoutPositions = [
        { x: startX, y: startY },
        { x: startX + boxWidth + padding, y: startY },
        { x: startX + 2 * (boxWidth + padding), y: startY },
        { x: startX, y: startY + boxHeight + padding },
        { x: startX + boxWidth + padding, y: startY + boxHeight + padding },
        { x: startX + 2 * (boxWidth + padding), y: startY + boxHeight + padding },
        { x: startX, y: startY + 2 * (boxHeight + padding) },
        { x: startX + boxWidth + padding, y: startY + 2 * (boxHeight + padding) },
        { x: startX + 2 * (boxWidth + padding), y: startY + 2 * (boxHeight + padding) }
    ];

    // Draw stats in colored boxes with rounded corners and shadows
    statsArray.forEach((stat, index) => {
        const pos = layoutPositions[index];

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(pos.x + shadowOffset, pos.y + shadowOffset, boxWidth, boxHeight);

        // Box
        ctx.fillStyle = colors[index % colors.length];
        fillRoundRect(ctx, pos.x, pos.y, boxWidth, boxHeight, borderRadius);

        // Text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(stat.name + ":", pos.x + 20, pos.y + boxHeight / 3);
        ctx.fillText(stat.value, pos.x + 20, pos.y + 2 * boxHeight / 3);
    });

    // Add a full Minecraft skin preview
    const skinUrl = `https://crafatar.com/renders/body/${uuid}?scale=10&default=MHF_Steve&overlay`;
    const skinImage = await loadImage(skinUrl);
    ctx.drawImage(skinImage, 700, 100, 150, 300);

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