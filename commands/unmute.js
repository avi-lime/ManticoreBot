const Discord = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('unmute a user')
        .addUserOption(option => option.setName('target').setDescription('user to unmute').setRequired(true)),
    async execute(interaction) {
        var perms = await checkPerms(interaction, { roleIdArray: ['552048116552040449'] })
        if (!perms) return
        const user = interaction.options.getUser('target')
        var member = interaction.guild.members.cache.get(user.id)
        var unmuteEmbed = new Discord.MessageEmbed()
            .setTitle(`Umuted **${user.tag}**`)
            .setColor(member.displayHexColor)

        member.timeout(null).then(
            await interaction.reply({ embeds: [unmuteEmbed] })
        )
    }
}