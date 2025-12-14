const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder
} = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('node:path');
require("dotenv").config();
const { linkedAccounts, saveLinkedAccounts, calculateRatios, getLuckyBlockStats, getSimpleLuckyBlockStats, cache } = require('./functions/lbbedwars');
const { getPlayerUUID, verifyMinecraftUsername, getPlayerSocials } = require('./functions/mcdata');
const guildCreateHandler = require("./otherevents/guildcreate.js");
const guildDeleteHandler = require("./otherevents/guilddelete.js");
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildBans]
});

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

const specifiedServerId = process.env.SPECIFIED_SERVER_ID || '1330128389348261938';

// Cache for ban list to avoid fetching on every interaction
let banListCache = {
    bans: new Set(),
    lastUpdate: 0,
    updateInterval: 5 * 60 * 1000 // 5 minutes
};

async function updateBanListCache(guild) {
    const now = Date.now();
    if (now - banListCache.lastUpdate < banListCache.updateInterval) {
        return; // Cache is still valid
    }
    try {
        const bans = await guild.bans.fetch();
        banListCache.bans = new Set(bans.map(ban => ban.user.id));
        banListCache.lastUpdate = now;
    } catch (error) {
        console.error('Error updating ban list cache:', error);
    }
}

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}
guildCreateHandler(client);
guildDeleteHandler(client);

client.on('interactionCreate', async interaction => {
    const specifiedServer = client.guilds.cache.get(specifiedServerId);
    if (!specifiedServer) {
        console.error(`Server with ID ${specifiedServerId} not found.`);
        return;
    }
    await updateBanListCache(specifiedServer);
    if (banListCache.bans.has(interaction.user.id)) {
        await interaction.reply({ content: 'You have been banned from using this bot.', ephemeral: true });
        return;
    }
    if (interaction.isButton()) {
        if (interaction.customId.startsWith("leave_")) {
            const guildId = interaction.customId.split("_")[1];
            const guild = client.guilds.cache.get(guildId);
            try {
                await interaction.deferReply({ ephemeral: true });
                if (guild) {
                    await guild.leave();
                    console.info(`Left the server: ${guild.name} (${guild.id})`);
                    await interaction.editReply("Successfully left the server");
                } else {
                    await interaction.editReply("Server not found.");
                }
            } catch (error) {
                console.error('Error leaving server:', error);
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply("Failed to leave the server.");
                } else {
                    await interaction.reply({ content: "Failed to leave the server.", ephemeral: true });
                }
            }
        }
    }

    if (!interaction.isCommand())
        return;
    const { commandName, options, user } = interaction;

    // Helper function to validate Minecraft username
    function validatePlayerName(name) {
        if (!name) return false;
        // Minecraft usernames: 3-16 characters, alphanumeric and underscores only
        return /^[a-zA-Z0-9_]{3,16}$/.test(name);
    }

    if (commandName === 'stats') {
        try {
            const gameType = options.getString('gamemode');
            let playerName = options.getString('player');
            const simpleOption = options.getString('simple');
            const simple = simpleOption === 'true' || options.getBoolean('simple') || false;

            let showLinkMessage = false;

            if (!playerName) {
                if (linkedAccounts[user.id]) {
                    playerName = linkedAccounts[user.id];
                } else {
                    await interaction.reply('No player specified and no linked account found.\nDid you know you can use /link to not need to specify your player name');
                    return;
                }
            } else if (!linkedAccounts[user.id]) {
                showLinkMessage = true;
            }

            // Validate player name
            if (!validatePlayerName(playerName)) {
                await interaction.reply('Invalid player name. Minecraft usernames must be 3-16 characters and contain only letters, numbers, and underscores.');
                return;
            }

            if (simple) {
            const stats = await getSimpleLuckyBlockStats(gameType, playerName);
            if (typeof stats === 'string') {
                await interaction.reply(stats);
                return;
            }
            if (stats.error) {
                await interaction.reply(stats.error);
                return;
            }

            const uuid = await getPlayerUUID(playerName);


            const simpleStatsEmbed = new EmbedBuilder().setColor(`#e4ff00`).setTitle(`Simple stats for ${playerName} in Lucky Block ${gameType}`).addFields({
                name: 'Winstreak',
                value: stats.Winstreak.toString(),
                inline: true
            }, {
                name: 'Games Played',
                value: stats["Games Played"].toString(),
                inline: true
            }, {
                name: 'Wins',
                value: stats.Wins.toString(),
                inline: true
            }, {
                name: 'Loss',
                value: stats.Loss.toString(),
                inline: true
            }, {
                name: 'Beds Broken',
                value: stats["Beds Broken"].toString(),
                inline: true
            }, {
                name: 'Beds Lost',
                value: stats["Beds Lost"].toString(),
                inline: true
            }, {
                name: 'Kills',
                value: stats.Kills.toString(),
                inline: true
            }, {
                name: 'Deaths',
                value: stats.Deaths.toString(),
                inline: true
            }, {
                name: 'Final Kills',
                value: stats["Final Kills"].toString(),
                inline: true
            }, {
                name: 'Final Deaths',
                value: stats["Final Deaths"].toString(),
                inline: true
            }).setTimestamp().setFooter({
                text: `${interaction.user.tag} | Stats are updated every 5 minutes`,
                iconURL: interaction.user.displayAvatarURL(
                    { dynamic: true }
                )
            }).setThumbnail(`https://vzge.me/bust/256/${uuid}.png?y=-40`);

            await interaction.reply({ embeds: [simpleStatsEmbed] });
        } else {
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
            cache[`stats-${playerName}`] = stats;
            const statsEmbed = new EmbedBuilder().setColor(`#e4ff00`).setTitle(`Stats in Lucky Block ${gameType} for ${playerName}`).addFields({
                name: 'Basic Stats', value: `
                    Winstreak: ${stats.Winstreak}
                    Games Played: ${stats["Games Played"]}
                    Wins: ${stats.Wins}
                    Loss: ${stats.Loss}
                    Beds Broken: ${stats["Beds Broken"]}
                    Beds Lost: ${stats["Beds Lost"]}
                    Placeable beds collected: ${stats["Placeable beds collected"]}
                `,
                inline: true
            }, {
                name: 'Kill Stats',
                value: `
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
                `,
                inline: true
            }, {
                name: 'Death Stats',
                value: `
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
                `,
                inline: true
            }, {
                name: '\u200b',
                value: '\u200b',
                inline: false
            }, {
                name: 'Final Kill Stats',
                value: `
                    Final Kills: ${stats["Final Kills"]}
                    Void Final Kills: ${stats["Void Final Kills"]}
                    Mob Final Kills: ${stats["Mob Final Kills"]}
                    Fall Damage Final Kills: ${stats["Fall Damage Final Kills"]}
                    Lava Final Kills: ${stats["Lava Final Kills"]}
                    Thorn Final Kills: ${stats["Thorn Final Kills"]}
                    Firetick Final Kills: ${stats["Firetick Final Kills"]}
                    Magic Final Kills: ${stats["Magic Final Kills"]}
                    Creeper Final Kills: ${stats["Creeper Final Kills"]}
                `,
                inline: true
            }, {
                name: 'Final Death Stats',
                value: `
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
                `,
                inline: true
            }).setTimestamp().setFooter({
                text: `${interaction.user.tag} | Stats are updated every 5 minutes`,
                iconURL: interaction.user.displayAvatarURL(
                    { dynamic: true }
                )
            }).setThumbnail(`https://vzge.me/bust/256/${uuid}.png?y=-40`);

            await interaction.reply({ embeds: [statsEmbed] });
            }

            if (showLinkMessage) {
                await interaction.followUp({
                    content: 'Did you know you can use </link:1326295407739015242> to not need to specify your player name',
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error('Error in stats command:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'An error occurred while fetching stats. Please try again later.', ephemeral: true });
            } else {
                await interaction.followUp({ content: 'An error occurred while fetching stats. Please try again later.', ephemeral: true });
            }
        }
    } else if (commandName === 'link') {
        try {
            const minecraftIGN = options.getString('minecraft_ign');
            
            // Validate player name
            if (!validatePlayerName(minecraftIGN)) {
                await interaction.reply('Invalid Minecraft username. Usernames must be 3-16 characters and contain only letters, numbers, and underscores.');
                return;
            }
            
            const verifiedUsername = await verifyMinecraftUsername(minecraftIGN);

            if (verifiedUsername) {
                try {
                    const socialMedia = await getPlayerSocials(minecraftIGN);
                    const discordTag = interaction.user.tag.toLowerCase();

                    if (socialMedia && socialMedia.links && socialMedia.links.DISCORD.toLowerCase() === discordTag) {
                        linkedAccounts[user.id] = minecraftIGN;
                        saveLinkedAccounts();
                        await interaction.reply(`Your Hypixel account ${minecraftIGN} has been successfully linked.`);
                    } else {
                        await interaction.reply('Your Discord tag does not match the one linked to the Minecraft account. Please link your Discord account on Hypixel.');
                    }
                } catch (error) {
                    console.error('Error during verification:', error);
                    await interaction.reply('Could not verify the Minecraft username. Please make sure it is correct.');
                }
            } else {
                await interaction.reply('Could not verify the Minecraft username. Please make sure it is correct.');
            }
        } catch (error) {
            console.error('Error in link command:', error);
            await interaction.reply({ content: 'An error occurred while linking your account. Please try again later.', ephemeral: true });
        }
    } else if (commandName === 'ratios') {
        try {
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

            // Validate player name
            if (!validatePlayerName(playerName)) {
                await interaction.reply('Invalid player name. Minecraft usernames must be 3-16 characters and contain only letters, numbers, and underscores.');
                return;
            }

            const uuid = await getPlayerUUID(playerName);

            let stats = cache[`stats-${playerName}`];
            if (!stats) {
                stats = await getLuckyBlockStats(gameType, playerName);
                if (typeof stats === 'string') {
                    await interaction.reply(stats);
                    return;
                }
                if (stats.error) {
                    await interaction.reply(stats.error);
                    return;
                }
                cache[`stats-${playerName}`] = stats;
            }

            const ratios = calculateRatios(stats);
            const ratioEmbed = new EmbedBuilder().setColor(`#e4ff00`).setTitle(`Ratios for ${playerName} in Lucky Block ${gameType}`).addFields({
                name: 'Win/Loss',
                value: ratios.winLossRatio.toFixed(2),
                inline: true
            }, {
                name: 'Kill/Death',
                value: ratios.killDeathRatio.toFixed(2),
                inline: true
            }, {
                name: 'Final Kill/Final Death',
                value: ratios.finalKillDeathRatio.toFixed(2),
                inline: true
            }, {
                name: 'Void Kill/Death',
                value: ratios.VoidKillRatio.toFixed(2),
                inline: true
            }, {
                name: 'Void Final Kill/Death',
                value: ratios.VoidFinalKillRatio.toFixed(2),
                inline: true
            }).setTimestamp().setFooter({
                text: `${interaction.user.tag} | Stats are updated every 5 minutes`,
                iconURL: interaction.user.displayAvatarURL(
                    { dynamic: true }
                )
            }).setThumbnail(`https://vzge.me/bust/256/${uuid}.png?y=-40`);

            await interaction.reply({ embeds: [ratioEmbed] });
        } catch (error) {
            console.error('Error in ratios command:', error);
            await interaction.reply({ content: `Failed to fetch ratios. Please try again later.`, ephemeral: true });
        }
    } else if (commandName === `info`) {
        const user = await client.users.fetch(`781305692371157034`);
        const avatarURL = user.displayAvatarURL({ format: 'png', dynamic: true });
        const info = new EmbedBuilder().setColor(`#8000ff`).setTitle(`Lucky Block Bedwars Bot`).setDescription(`This bot was designed and created by ooTruffle to fit the gap of no public bot doing this`).setThumbnail(avatarURL).setTimestamp().setFooter({
            text: `${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL(
                { dynamic: true }
            )
        });

        const githubButton = new ButtonBuilder().setLabel('GitHub Repo').setStyle('Link').setURL('https://github.com/ooTruffle/LuckyBlockBedwarsBot');
        const shamelessplug = new ButtonBuilder().setLabel('Shameless Plug').setStyle('Link').setURL('https://socials.fluffykiwi.net/');

        const row = new ActionRowBuilder().addComponents(githubButton, shamelessplug);

        await interaction.reply({ embeds: [info], components: [row] });
    } else if (commandName === 'ping') {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
        const timeDiff = sent.createdTimestamp - interaction.createdTimestamp;
        const pingEmbed = new EmbedBuilder().setColor(`#00ff00`).setTitle('Pong! 🏓').setDescription(`Latency: ${timeDiff}ms\nAPI Latency: ${
            Math.round(client.ws.ping)
        }ms`).setFooter({
            text: `${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL(
                { dynamic: true }
            )
        }).setTimestamp();

        await interaction.editReply({ embeds: [pingEmbed] });
    } else if (commandName == 'invite') {
        const user = await client.users.fetch(`1326253123102179418`);
        const avatarURL = user.displayAvatarURL({ format: 'png', dynamic: true });
        const info = new EmbedBuilder().setColor(`#8000ff`).setTitle(`How to invite the bot`).setDescription(`This is a private bot that can't be invited at this time`).setThumbnail(avatarURL).setTimestamp();
        await interaction.reply({ embeds: [info] });
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);