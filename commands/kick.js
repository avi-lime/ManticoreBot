const Discord = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('kick a member from the server')
        .addUserOption(option => option.setName('target').setDescription('user to kick').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('reason to kick'))
    ,
    async execute(interaction) {
        var perms = await checkPerms(interaction, { roleIdArray: ['552048116552040449'] })
        if (!perms) return
        const user = interaction.options.getUser('target')
        const member = interaction.guild.members.cache.get(user.id)
        const reason = interaction.options.getString('reason')
        if (!member) return await interaction.reply({ content: "Mention a proper member", ephemeral: true })
        var kickEmbed = new Discord.MessageEmbed()
            .setTitle(`Kicked **${user.tag}**`)
            .setColor('ORANGE')

        if (reason) {
            member.kick(reason).then(
                kickEmbed.addField('Reason', reason)
            )
        } else {
            member.kick()
        }
        await interaction.reply({ embeds: [kickEmbed] })
    }
}