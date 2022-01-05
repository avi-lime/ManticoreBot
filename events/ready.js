module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Logged in as ${client.user.tag}`);
		client.user.setPresence({
			status: 'dnd'
		})
		client.user.setActivity('with your mom', { type: 'PLAYING' })
	}
}