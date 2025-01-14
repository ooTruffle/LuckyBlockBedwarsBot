const { REST, Routes } = require('discord.js');
require("dotenv").config();



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
                    { name: 'Duos', value: 'Duos' },
                    { name: 'Fours', value: 'Fours' }
                ]
            },
            {
                name: 'simple',
                type: 5, // STRING
                description: 'Display Simplefied stats?',
                required: true,
                choices: [
                    { name: 'True', value: 'True' },
                    { name: 'False', value: 'false' }
                ]
            },
            {
                name: 'player',
                type: 3, // STRING
                description: 'The player name',
                required: false
            },
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
    },
    {
        name: 'ratios',
        description: 'Get Win/Loss, Kill/Death, Final Kill/Final Death ratios for a player',
        options: [
            {
                name: 'gamemode',
                type: 3, // STRING
                description: 'The game mode (Duos or Fours)',
                required: true,
                choices: [
                    { name: 'Duos', value: 'Duos' },
                    { name: 'Fours', value: 'Fours' }
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
        name: 'info',
        description: 'Get information about the bot'
    }
];

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();