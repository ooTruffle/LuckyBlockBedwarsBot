const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const logchannelid = "1330131850227613777";

module.exports = (client) => {
    client.on('guildCreate', guild => {
        const logChannel = client.channels.cache.get(logchannelid);
    
        // Create a button with the guild ID as the custom ID
        const leaveButton = new ButtonBuilder()
            .setCustomId(`leave_${guild.id}`)  // 'leave_' prefix is added to distinguish this ID
            .setLabel('Leave Server')
            .setStyle(ButtonStyle.Danger);
    
        // Create an action row
        const row = new ActionRowBuilder()
            .addComponents(leaveButton);
    
        // Create an embed message
        const embed = new EmbedBuilder()
            .setTitle(`Joined a new server: ${guild.name}`)
            .setColor('00ff27')
            .setDescription(`This server has ${guild.memberCount} members.`)
            .setThumbnail(guild.iconURL())
            .setTimestamp();
    
        // Send the embed and the button to the log channel
        console.log(`Joined ${guild.name} (${guild.id})!`);
        logChannel.send({ embeds: [embed], components: [row] });
    });
};