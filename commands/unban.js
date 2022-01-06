const Discord = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('unban a user from the server')
        .addStringOption(option => option.setName('user_id').setDescription('id of user to unban').setRequired(true))
    ,
    async execute(interaction) {
        var perms = await checkPerms(interaction, { roleIdArray: ['552048116552040449'] })
        if (!perms) return
        const user = interaction.options.getString('user_id')

        var unbanEmbed = new Discord.MessageEmbed()
            .setTitle(`User unbanned`)
            .setColor('BLUE')

        interaction.guild.members.unban(user)
        await interaction.reply({ embeds: [unbanEmbed] })
    }
}