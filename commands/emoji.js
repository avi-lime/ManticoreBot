const { SlashCommandBuilder } = require("@discordjs/builders")
const { checkPerms } = require('../import_folder/functions')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('emoji')
        .setDescription('add an emoji to the server')
        .addStringOption(option => option.setName('emoji_name').setDescription('name of the emoji').setRequired(true))
        .addStringOption(option => option.setName('url').setDescription('url of the emoji').setRequired(true))
    ,
    async execute(interaction) {
			if(interaction.guild.id === process.env['guildId']) {
				let perms = await checkPerms(interaction, {roleIdArray: ['860174816627523604']});
				if (!perms) return
			}
        const url = interaction.options.getString('url')
        const name = interaction.options.getString('emoji_name')
				interaction.guild.emojis.create(url, name)
					.then(emoji => {
							interaction.reply(`Created emoji ${emoji.toString()}\nname: ${emoji.name}\nid: ${emoji.id}\nstring: \`${emoji.toString()}\``)	
				})
		}
}