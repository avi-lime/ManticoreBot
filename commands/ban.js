const Discord = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders')
const {checkPerms} = require('../import_folder/functions')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('ban a member from the server')
        .addUserOption(option => option.setName('target').setDescription('user to ban').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('reason to ban'))
    ,
    async execute(interaction) {
			var perms = await checkPerms(interaction, {roleIdArray: ['552048116552040449']})
			if(!perms) return
        const user = interaction.options.getUser('target')
        const member = interaction.guild.members.cache.get(user.id)
        const reason = interaction.options.getString('reason')
				if(!member) return await interaction.reply({ content: "Mention a proper member", ephemeral: true })
        var banEmbed = new Discord.MessageEmbed()
            .setTitle(`Banned **${user.tag}**`)
            .setColor('RED')

        if (reason) {
            member.ban({ reason: reason }).then(
                banEmbed.addField('Reason', reason)
            )
        } else {
            member.ban()
        }
        await interaction.reply({ embeds: [banEmbed] })
    }
}