const { Events, ActivityType, } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
        try {

            client.user.setActivity("People Open Blocks", {type: ActivityType.Watching});
    
    
            const statuses = [
                {
                    name: "People getting Rouletted",
                    type: ActivityType.Watching
                }, {
                    name: "People Open Lucky Blocks",
                    type: ActivityType.Watching
                }, {
                    name: "Lucky Block Bedwars",
                    type: ActivityType.Playing
                },
    
            ];
    
    
            let statusIndex = 0;
            setInterval(() => {
                statusIndex = (statusIndex + 1) % statuses.length;
                client.user.setActivity(statuses[statusIndex].name, {type: statuses[statusIndex].type});
            }, 300000);
        } catch (error) {
            console.error("Error during bot initialization:", error);
        }
	},
};
