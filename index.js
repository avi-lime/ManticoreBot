require('dotenv').config()
const fs = require('fs');
const fetch = require('node-fetch')
const { Client, Collection, Intents } = require('discord.js');
const token = process.env.token;
const client = new Client({ intents: [Intents.FLAGS.GUILDS, "GUILD_MESSAGES", "DIRECT_MESSAGES", "GUILD_MEMBERS"] });
client.commands = new Collection();


// importing 
const commandFiles = fs.readdirSync("./commands").filter(files => files.endsWith(".js"));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// sub count
var APIKey = process.env.APIKey;
var Userid = process.env.youtubeChannelId;
function setSubs() {
	var subscriberCount
	return fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${Userid}&key=${APIKey}`)
		.then(response => {
			return response.json()
		})
		.then(data => {
			subscriberCount = data["items"][0].statistics.subscriberCount;
			client.channels.cache.get('927238827058282516').setName(`✦│Subscribers: ${subscriberCount}`)
		})

}

// member count
function setMember() {
	var count = client.guilds.cache.get(process.env.guildId).memberCount
	var goal = Math.ceil(count / 100) == (count / 100) ? ((count / 100) + 1) * 100 : Math.ceil(count / 100) * 100
	client.channels.cache.get('926494629988286464').setName(`ME ARMY: ${count}`)
	client.channels.cache.get('927245164244783145').setName(`NEXT GOAL: ${goal}`)
}

setInterval(async () => {
	// member count
	setMember()
	// sub count
	setSubs()

}, 10 * 60 * 1000)


client.login(token);