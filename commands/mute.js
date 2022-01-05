const Discord = require('discord.js')
const { SlashCommandBuilder, userMention } = require('@discordjs/builders');
const { parseTime, checkPerms } = require("../import_folder/functions")
module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('timeout a user')
        .addUserOption(option => option.setName('target').setDescription('The user to mute').setRequired(true))
        .addStringOption(option => option.setName('time').setDescription('how long to mute for, ex="1h20m"'))
        .addStringOption(option => option.setName('reason').setDescription('reason for mute')),

    async execute(interaction) {
			var perms = await checkPerms(interaction, {roleIdArray: ['552048116552040449']})
			if(!perms) return
        const user = interaction.options.getUser('target');
        const timeString = interaction.options.getString('time') || "10m"; // default time is 10m
        const reason = interaction.options.getString('reason') || "";

        if (!timeString.match(/^([0-9]+d)?([0-9]+h)?([0-9]+m)?([0-9]+s)?$/i))
            return await interaction.reply({ content: "Time format should be in '1d2h3m4s' format", ephemeral: true })

        var member = interaction.guild.members.cache.get(user.id);
				if(!member) return await interaction.reply({ content: "Mention a proper member", ephemeral: true })
        var { endTime, timestr } = parseTime(timeString)
        if (endTime < 60000)
            return await interaction.reply({ content: 'Time must be more than 60 seconds', ephemeral: true })
        var muteEmbed = new Discord.MessageEmbed()
            .setTitle(`Muted **${member.user.tag}**`)
            .addField('Time', timestr)
            .setColor(member.displayHexColor)

				
        	if (!reason) {
            	member.timeout(endTime)
        	} else {
            	member.timeout(endTime, reason).then(
                	muteEmbed.addField('Reason', reason)
            	)
        	}
					await interaction.reply({ embeds: [muteEmbed] })
				
        
    },
};