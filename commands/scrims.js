const Discord = require("discord.js");
const { SlashCommandBuilder, roleMention, codeBlock } = require("@discordjs/builders");
const { checkPerms } = require('../import_folder/functions');
const { formatString, rulesString } = require('../import_folder/strings')
const Database = require('@replit/database');
const scrimsDB = new Database();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('scrims')
        .setDescription('command to host scrims')
        .addSubcommand(subcommand => subcommand.setName('format').setDescription('format of registration for scrims'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('start the scrims')
                .addStringOption(option => option.setName('time').setDescription('time of the scrims').setRequired(true)
                    .addChoice('1 pm', '1')
                    .addChoice('2 pm', '2')
                    .addChoice('3 pm', '3')
                    .addChoice('4 pm', '4')
                    .addChoice('5 pm', '5')
                    .addChoice('6 pm', '6')
                    .addChoice('7 pm', '7')
                    .addChoice('8 pm', '8')
                    .addChoice('9 pm', '9')
                    .addChoice('10 pm', '10')
                    .addChoice('11 pm', '11'))

        )
        .addSubcommand(subcommand =>
            subcommand.setName('stop').setDescription("stops the scrims")
        )
        .addSubcommand(subcommand =>
            subcommand.setName('rules').setDescription("rules for scrims")
        )
        .addSubcommand(subcommand =>
            subcommand.setName('list').setDescription('slot list of currently running scrims.')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('idp').setDescription('send id pass in an embed')
                .addStringOption(option => option.setName('id').setDescription('id for the custom room').setRequired(true))
                .addStringOption(option => option.setName('pass').setDescription('password for the custom room').setRequired(true))
        )
    ,
    async execute(interaction) {
        var time = interaction.options.getString('time');
        var collector;
        var formatEmbed = new Discord.MessageEmbed()
            .setTitle("Registration Format")
            .setDescription(
                codeBlock(formatString)
            )
            .setColor('ORANGE')
            .setAuthor({ name: `Manticore Esports Scrims`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setFooter({ text: 'You can tap and hold to copy the format on phone' });

        var rulesEmbed = new Discord.MessageEmbed()
            .setTitle("T3 RULES")
            .setDescription(rulesString)
            .setColor('ORANGE')
            .setAuthor({ name: `Manticore Esports Scrims`, iconURL: interaction.guild.iconURL({ dynamic: true }) });

        const scrimsRules = async (interaction) => {
            await interaction.reply({ embeds: [rulesEmbed] });
        }
        const scrimsFormat = async (interaction) => {
            await interaction.reply({ embeds: [formatEmbed] });
        }

        // const function to announce the scrims
        const announce = async (interaction) => {
            let perms = await checkPerms(interaction, { roleIdArray: ['860174816627523604'], channelIdArray: ['859124396560220210'] })
            if (!perms) return;
            let status = await scrimsDB.get("status")
            if (status) return await interaction.reply({ content: 'Scrims already running.', ephemeral: true }) // annouce the scrims
            await scrimsDB.set("scrimsChannel", interaction.channel.id);
            // start the scrims, 2 minutes later
            var toStartEmbed = new Discord.MessageEmbed()
                .setTitle(`Registrations for ${time} P.M. T3 scrims.`)
                .setColor('BLACK')
                .setDescription('Please make sure to follow the format properly and mention atleast 4 people!\nThe bot will react with <a:mntTick:927551818886692944> if your team has been accepted.\nThe bot will react with <a:mntX:927558589126680657> if your registration has an issue, please contact a mod if you have any issues.')
                .setFooter({ text: `registrations will begin at ${time} P.M.`, iconURL: 'https://cdn.discordapp.com/icons/524882376594030602/b88738557bb793259f48727644a1832c.webp?size=1024' });

            await interaction.channel.send({ content: roleMention('893213632949796875'), embeds: [toStartEmbed, formatEmbed] });
            await interaction.reply({ content: "Please make sure to use `/scrims stop` when the custom game ends.", ephemeral: true });
            const timeInterval = setInterval(function () { countdown() }, 1000)
            function countdown() {
                var now = new Date()
                var hours = now.getHours()
                var minutes = now.getMinutes()
                if (hours == (parseInt(time) + 12 - 6) && minutes == 30) {
                    scrimsStart(interaction)
                    clearTime()
                }
            }
            function clearTime() {
                clearInterval(timeInterval)
            }
        }

        const scrimsStart = async (interaction) => {

            var startEmbed = new Discord.MessageEmbed()
                .setTitle('**<:mntStar:927485858322456618> Registration Started**')
                .setColor('BLACK');

            await interaction.channel.send({ embeds: [startEmbed] })
            await interaction.channel.permissionOverwrites.edit(process.env['guildId'], {
                SEND_MESSAGES: true
            })
            await scrimsDB.set("list", []);
						await scrimsDB.set("status", true);
            collector = await interaction.channel.createMessageCollector()
            collector.on("collect", async m => {
                if (m.author.bot) return
                let teamStr = m.content.split('\n')[0];

                if ((m.mentions.members.size >= 4 && m.mentions.members.size <= 5)) {
                    if (!(teamStr.match(/(team name -)|(team name)|(team)/i))) return;
                    m.mentions.members.each(user => {
                        if (user.bot) return interaction.reply(`Don't tag bots in your message`);
                    })
                    var teamName = teamStr.replace(/(team name -)|(team name)|(team)/i, "").trim();
                    var slots = await scrimsDB.get("list")
                    if (slots.find(slot => slot.userid === m.author.id)) {
                        return await m.reply({ content: "Your team has already been registered", ephemeral: true })
                    }
                    await slots.push({ "slotNum": slots.length + 1, "team": teamName, "userid": m.author.id })
                    await scrimsDB.set("list", slots)
                    await interaction.guild.channels.cache.get('859133820128329779').permissionOverwrites.edit(m.author.id, { VIEW_CHANNEL: true })
                    if (slots.length === 20) {
                        await scrimsRegStop(collector, interaction);
                    }
                    await m.react('927551818886692944')
                } else {
                    await m.react('927558589126680657')
                    await m.reply({ content: 'Please follow the format.', ephemeral: true });
                    return;
                }
            })

        }

        const scrimsRegStop = async (collector, interaction) => {

            collector.stop();

            let scrimsChannelID = await scrimsDB.get("scrimsChannel")
            let scrimsChannel = interaction.guild.channels.cache.get(scrimsChannelID);
            let slotChannel = interaction.guild.channels.cache.get('859133769986342952')
            let slots = await scrimsDB.get("list")
            var slotEmbed = createSlotList(slots)

            await scrimsChannel.permissionOverwrites.edit(process.env['guildId'], {
                SEND_MESSAGES: false
            });
            var regStopEmbed = new Discord.MessageEmbed()
                .setAuthor({ name: `Manticore Scrims`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                .setColor("RED")
                .setDescription(`All slots full, registrations have been closed!\nYou can check your slot number in ${slotChannel.toString()}`)

            await scrimsChannel.send({ embeds: [regStopEmbed] })
            await slotChannel.send({ embeds: [slotEmbed] })
        }

        const scrimsStop = async (interaction) => {
            if (!await scrimsDB.get("status")) return await interaction.reply({ content: "Scrims not started", ephemeral: true })
            let perms = await checkPerms(interaction, { roleIdArray: ['860174816627523604', '927918856402534471'], channelIdArray: ['859124396560220210'] })
            if (!perms) return;
            await scrimsRegStop(collector, interaction)
            scrimsDB.get("scrimsChannel").then(async scrimsChannelID => {
                let scrimsChannel = interaction.guild.channels.cache.get(scrimsChannelID);
                await scrimsChannel.permissionOverwrites.edit(process.env['guildId'], {
                    SEND_MESSAGES: false
                });
                await interaction.reply({ content: `Scrims stopped.`, ephemeral: true });
                await scrimsDB.set("status", false);
                var slotList = await scrimsDB.get("list");
                slotList.forEach(async slot => {
                    await interaction.guild.channels.cache.get('859133820128329779').permissionOverwrites.delete(slot.userid, { VIEW_CHANNEL: true })
                })
                await scrimsDB.set("list", []);
            })
        }

        const createSlotList = (slotList) => {
            var slots = ""
            slotList.forEach(slot => {
                slots += `${slot.slotNum} - ${slot.team}\n`
            })
            var slotEmbed = new Discord.MessageEmbed()
                .setAuthor({ name: `Manticore Scrims`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                .setTitle('Scrims Slot list')
                .setDescription(codeBlock(slots))
                .setColor('ORANGE')
            return slotEmbed
        }

        const scrimsList = async (interaction) => {
            let status = await scrimsDB.get("status")
            if (!status) return await interaction.reply({ content: "No scrims running", ephemeral: true })

            let slotList = await scrimsDB.get("list")

            if (!slotList.length) return await interaction.reply({ content: "No teams have joined", ephemeral: true })

            var slotEmbed = createSlotList(slotList)

            await interaction.reply({ embeds: [slotEmbed] })
        }

        const scrimsIdp = async (interaction) => {
            let perms = await checkPerms(interaction, { roleIdArray: ['860174816627523604', '927918856402534471'], channelIdArray: ['859133820128329779'] })
            if (!perms) return;
            var id = interaction.options.getString('id')
            var pass = interaction.options.getString('pass')
            var idpEmbed = new Discord.MessageEmbed()
                .setAuthor({ name: `Manticore Scrims`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                .setTitle(`Scrims ID Pass`)
                .addField("ID", codeBlock(id))
                .addField("Password", codeBlock(pass))
                .addField("\u200b", `- Please don't share the room id pass with anyone but your team\n- Join the custom room on time`)
                .setColor('ORANGE')

            await interaction.channel.send({ content: roleMention('893213632949796875'), embeds: [idpEmbed] })
            await interaction.reply({ content: 'posted.', ephemeral: true })
        }

        switch (interaction.options.getSubcommand()) {
            case "format":
                await scrimsFormat(interaction);
                break;
            case "start":
                await announce(interaction);
                break;
            case "stop":
                await scrimsStop(interaction);
                break;
            case "rules":
                await scrimsRules(interaction);
                break;
            case "list":
                await scrimsList(interaction);
                break;
            case "idp":
                await scrimsIdp(interaction);
                break;
        }
    }
}