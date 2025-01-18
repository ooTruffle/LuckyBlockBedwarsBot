const { 
    client,
    Events,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder } = require('discord.js');
    const { linkedAccounts, saveLinkedAccounts, calculateRatios, getLuckyBlockStats, getSimpleLuckyBlockStats, cache } = require('../functions/lbbedwars');
    const { getPlayerUUID, verifyMinecraftUsername,} = require('../functions/mcdata');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isCommand()) 
                return;
            
        
        
            const {commandName, options, user} = interaction;
        
            if (commandName === 'stats') {
                const gameType = options.getString('gamemode');
                let playerName = options.getString('player');
                const simple = options.getBoolean('simple') || false;
        
                if (! playerName) {
                    if (linkedAccounts[user.id]) {
                        playerName = linkedAccounts[user.id];
                    } else {
                        await interaction.reply('No player specified and no linked account found.');
                        return;
                    }
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
                            text: `${
                            interaction.user.tag
                        }`,
                        iconURL: interaction.user.displayAvatarURL(
                            {dynamic: true}
                        )
                    }).setThumbnail(`https://minotar.net/helm/${uuid}.png`);
        
                    await interaction.reply({embeds: [simpleStatsEmbed]});
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
        
                    // Cache the stats
                    cache[`stats-${playerName}`] = stats;
        
                    const statsEmbed = new EmbedBuilder().setColor(`#e4ff00`).setTitle(`Stats in Lucky Block ${gameType} for ${playerName}`).addFields({
                            name: 'Basic Stats', value: `
                                Winstreak: ${
                            stats.Winstreak
                        }
                                Games Played: ${
                            stats["Games Played"]
                        }
                                Wins: ${
                            stats.Wins
                        }
                                Loss: ${
                            stats.Loss
                        }
                                Beds Broken: ${
                            stats["Beds Broken"]
                        }
                                Beds Lost: ${
                            stats["Beds Lost"]
                        }
                                Placeable beds collected: ${
                            stats["Placeable beds collected"]
                        }
                            `,
                        inline: true
                    }, {
                        name: 'Kill Stats',
                        value: `
                                Kills: ${
                            stats.Kills
                        }
                                Fall Damage Kills: ${
                            stats["Fall Damage Kills"]
                        }
                                Void Kills: ${
                            stats["Void Kills"]
                        }
                                Mob Kills: ${
                            stats["Mob Kills"]
                        }
                                Creeper Kills: ${
                            stats["Creeper Kills"]
                        }
                                Thorn Kills: ${
                            stats["Thorn Kills"]
                        }
                                Fire Kills: ${
                            stats["Fire Kills"]
                        }
                                Firetick Kills: ${
                            stats["Firetick Kills"]
                        }
                                Projectile Kills: ${
                            stats["Projectile Kills"]
                        }
                                Magic Kills: ${
                            stats["Magic Kills"]
                        }
                            `,
                        inline: true
                    }, {
                        name: 'Death Stats',
                        value: `
                                Deaths: ${
                            stats.Deaths
                        }
                                Void Deaths: ${
                            stats["Void Deaths"]
                        }
                                Mob Deaths: ${
                            stats["Mob Deaths"]
                        }
                                Creeper Deaths: ${
                            stats["Crepper Deaths"]
                        }
                                Fall Damage Deaths: ${
                            stats["Fall Damage Deaths"]
                        }
                                Thorn Deaths: ${
                            stats["Thorn Deaths"]
                        }
                                Magic Deaths: ${
                            stats["Magic Deaths"]
                        }
                                Wither Deaths: ${
                            stats["Wither Deaths"]
                        }
                                Suffocation Deaths: ${
                            stats["Suffocation Deaths"]
                        }
                                Block Explosion Deaths: ${
                            stats["Block Explosion Deaths"]
                        }
                                Fire Deaths: ${
                            stats["Fire Deaths"]
                        }
                                Fire Tick Deaths: ${
                            stats["Fire Tick Deaths"]
                        }
                                Lava Deaths: ${
                            stats["lava Deaths"]
                        }
                                Projectile Deaths: ${
                            stats["Projectile Deaths"]
                        }
                                Falling Block Deaths: ${
                            stats["Falling Block Deaths"]
                        }
                            `,
                        inline: true
                    }, {
                        name: '\u200b',
                        value: '\u200b',
                        inline: false
                    }, {
                        name: 'Final Kill Stats',
                        value: `
                                Final Kills: ${
                            stats["Final Kills"]
                        }
                                Void Final Kills: ${
                            stats["Void Final Kills"]
                        }
                                Mob Final Kills: ${
                            stats["Mob Final Kills"]
                        }
                                Fall Damage Final Kills: ${
                            stats["Fall Damage Final Kills"]
                        }
                                Lava Final Kills: ${
                            stats["Lava Final Kills"]
                        }
                                Thorn Final Kills: ${
                            stats["Thorn Final Kills"]
                        }
                                Firetick Final Kills: ${
                            stats["Firetick Final Kills"]
                        }
                                Magic Final Kills: ${
                            stats["Magic Final Kills"]
                        }
                                Creeper Final Kills: ${
                            stats["Creeper Final Kills"]
                        }
                            `,
                        inline: true
                    }, {
                        name: 'Final Death Stats',
                        value: `
                                Final Deaths: ${
                            stats["Final Deaths"]
                        }
                                Void Final Deaths: ${
                            stats["Void Final Deaths"]
                        }
                                Mob Final Deaths: ${
                            stats["Mob Final Deaths"]
                        }
                                Creeper Final Deaths: ${
                            stats["Creeper Final Deaths"]
                        }
                                Fall Damage Final Deaths: ${
                            stats["Fall Damage Final Deaths"]
                        }
                                Lava Final Deaths: ${
                            stats["Lava Final Deaths"]
                        }
                                Thorn Final Deaths: ${
                            stats["Thorn Final Deaths"]
                        }
                                Magic Final Deaths: ${
                            stats["Magic Final Deaths"]
                        }
                                Suffocation Final Deaths: ${
                            stats["Suffocation Final Deaths"]
                        }
                                Wither Final Deaths: ${
                            stats["Wither Final Deaths"]
                        }
                                Fire Tick Final Deaths: ${
                            stats["Fire Tick Final Deaths"]
                        }
                                Block Explosion Final Deaths: ${
                            stats["Block Explosion Final Deaths"]
                        }
                                Projectile Final Deaths: ${
                            stats["Projectile Final Deaths"]
                        }
                                Falling Block Final Deaths: ${
                            stats["Falling Block Final Deaths"]
                        }
                            `,
                        inline: true
                    }).setTimestamp().setFooter({
                            text: `${
                            interaction.user.tag
                        }`,
                        iconURL: interaction.user.displayAvatarURL(
                            {dynamic: true}
                        )
                    }).setThumbnail(`https://minotar.net/helm/${uuid}.png`);
        
                    await interaction.reply({embeds: [statsEmbed]});
                }
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
        
                if (! playerName) {
                    if (linkedAccounts[user.id]) {
                        playerName = linkedAccounts[user.id];
                    } else {
                        await interaction.reply('No player specified and no linked account found.');
                        return;
                    }
                }
        
                try {
                    const uuid = await getPlayerUUID(playerName);
        
                    let stats = cache[`stats-${playerName}`];
                    if (! stats) {
                        stats = await getLuckyBlockStats(gameType, playerName);
                        if (typeof stats === 'string') {
                            await interaction.reply(stats);
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
                            text: `${
                            interaction.user.tag
                        }`,
                        iconURL: interaction.user.displayAvatarURL(
                            {dynamic: true}
                        )
                    }).setThumbnail(`https://minotar.net/helm/${uuid}.png`);
        
                    await interaction.reply({embeds: [ratioEmbed]});
                } catch (error) {
                    await interaction.reply(`Failed to fetch player UUID for ${playerName}.`);
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
        
                if (! playerName) {
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
                            text: `${
                            interaction.user.tag
                        }`,
                        iconURL: interaction.user.displayAvatarURL(
                            {dynamic: true}
                        )
                    }).setThumbnail(`https://minotar.net/helm/${uuid}.png`);
        
                    await interaction.reply({embeds: [ratioEmbed]});
                } catch (error) {
                    await interaction.reply(`Failed to fetch player UUID for ${playerName}.`);
                }
            } else if (commandName === `info`) {
                const user = await client.users.fetch(`781305692371157034`);
                const avatarURL = user.displayAvatarURL({format: 'png', dynamic: true});
                const info = new EmbedBuilder().setColor(`#8000ff`).setTitle(`Lucky Block Bedwars Bot`).setDescription(`This bot was designed and created by ooTruffle to fit the gap of no public bot doing this.`).setThumbnail(avatarURL)
        
                const githubButton = new ButtonBuilder().setLabel('GitHub Repo').setStyle('Link').setURL('https://github.com/ooTruffle/LuckyBlockBedwarsBot');
        
                const row = new ActionRowBuilder().addComponents(githubButton);
        
        
                await interaction.reply({embeds: [info], components: [row]});
            } else if (commandName === 'ping') {
                const sent = await interaction.reply({content: 'Pinging...', fetchReply: true});
                const timeDiff = sent.createdTimestamp - interaction.createdTimestamp;
                const pingEmbed = new EmbedBuilder().setColor(`#00ff00`).setTitle('Pong! 🏓').setDescription(`Latency: ${timeDiff}ms\nAPI Latency: ${
                    Math.round(client.ws.ping)
                }ms`).setFooter({
                        text: `${
                        interaction.user.tag
                    }`,
                    iconURL: interaction.user.displayAvatarURL(
                        {dynamic: true}
                    )
                }).setTimestamp();
        
        
                await interaction.editReply({embeds: [pingEmbed]});
            }
        }
    };