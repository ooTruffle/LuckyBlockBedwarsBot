
const { EmbedBuilder, } = require('discord.js');
const logchannelid = "1330131850227613777";

module.exports = (client) => {
    client.on('guildDelete', guild => {
        
        const logChannel = client.channels.cache.get(logchannelid);
    
        // Create an embed message
        const embed = new EmbedBuilder()
            .setTitle(`Left a server: ${guild.name}`)
            .setColor('ff0000')
            .setDescription(`This server has ${guild.memberCount} members.`)
            .setThumbnail(guild.iconURL())
            .setTimestamp();
    
        // Send the embed to the log channel
        logChannel.send({ embeds: [embed] });
        console.log(`Left ${guild.name} (${guild.id})!`);
    });
}
