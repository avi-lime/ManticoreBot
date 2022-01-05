const { SlashCommandBuilder } = require('@discordjs/builders')
const Discord = require('discord.js')
const { checkPerms } = require('../import_folder/functions')
const { aboutString } = require('../import_folder/strings')
module.exports = {
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('About us for the server')
	,
	async execute(interaction) {
		let perms = await checkPerms(interaction, { roleIdArray: ['860174816627523604'] });
		if (!perms) return
		var serverInfoEmbed = new Discord.MessageEmbed()
			.setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
			.setTitle("ABOUT US")
			.setImage('https://cdn.discordapp.com/attachments/859397547003871242/893240609379328081/standard.gif')
			.setColor('RED')
			.setDescription(aboutString)

		const links = new Discord.MessageActionRow()
			.addComponents(
				new Discord.MessageButton()
					.setLabel('Youtube')
					.setStyle('LINK')
					.setEmoji('927932968276733962')
					.setURL('https://www.youtube.com/c/MANTICOREESPORTSPubgmobile'),
				new Discord.MessageButton()
					.setLabel('Instagram')
					.setStyle('LINK')
					.setEmoji('927933249769074728')
					.setURL('https://www.instagram.com/_manticore_esports_/')
			);
		await interaction.reply({ embeds: [serverInfoEmbed], components: [links] })
	}
}