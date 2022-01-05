async function checkPerms(interaction, { roleIdArray, channelIdArray }) {
    var roles = roleIdArray;
    var channels = channelIdArray;
    if (channels) {
        if (!channels.includes(interaction.channel.id)) {
            await interaction.reply({ content: `You can't use this command here!`, ephemeral: true });
            return false;
        }
    } else if (interaction.member.roles.cache.some(r => roles.includes(r.id))) {
        return true;
    } else {
        await interaction.reply({ content: `Sorry you don't have permissions to use this command.`, ephemeral: true });
        return false;
    }
    return true
}

async function checkCC(interaction, { categoryArray, channelArray }) {

    var categories = categoryArray || []
    var channels = channelArray || []
    if (categories) {
        categories.forEach(category => {
            interaction.client.channels.cache.get(category).children.forEach(child => {
                channels.push(child.id);
            })
        })
    }
    if (channels) {
        if (channels.includes(interaction.channel.id)) {
            await interaction.reply({ content: `You can't use this command here!`, ephemeral: true })
            return false
        }
    }
    return true
}

function parseTime(timeString) {
    var timestr = ""
    var endTime = 1
    if (timeString) {
        var days = timeString.includes('d') ? timeString.split('d')[0] : 0
        var hours = (days[1] && days[1].includes('h')) ? days[1].split('h')[0] : timeString.includes('h') ? timeString.split('h')[0] : days ? 24 : 0
        var minutes = (hours[1] && hours[1].includes('m')) ? hours[1].split('m')[0] : timeString.includes('m') ? timeString.split('m')[0] : days || hours ? 60 : 0
        var seconds = (minutes[1] && minutes.includes('s')) ? minutes[1].split('s')[0] : timeString.includes('s') ? timeString.split('s')[0] : days || hours || minutes ? 60 : 0

        // 1d20h = 24 * 20 * 60 * 60 * 1000
        // 10m = 10 * 60 * 1000
        if (!days) endTime *= 1
        else endTime *= days
        if (!hours) endTime *= 1
        else endTime *= hours
        if (!minutes) endTime *= 1
        else endTime *= minutes
        if (!seconds) endTime *= 1
        else endTime *= seconds
        endTime *= 1000
    }
    if (days) timestr += `${days} Days `
    if (hours && hours != 24) timestr += `${hours} Hours `
    if (minutes && minutes != 60) timestr += `${minutes} Minutes `
    if (seconds && seconds != 60) timestr += `${seconds} Seconds `

    return { endTime, timestr }
}
module.exports = { checkPerms, checkCC, parseTime };