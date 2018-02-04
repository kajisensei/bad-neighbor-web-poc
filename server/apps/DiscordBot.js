/**
 * Created by Cossement Sylvain on 25-04-17.
 */

const discord = require('discord.js');
const winston = require('winston');

const client = new discord.Client();
const APP_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_NAME = process.env.DISCORD_CHANNEL || "general";
const CHANNEL_WRITE = process.env.DISCORD_CHANNEL_WRITE || "annonces-site";
const CHANNEL_ANOUNCEMENT = process.env.DISCORD_CHANNEL_ANOUNCEMENT || process.env.DISCORD_CHANNEL || "annonces-officielles";

// Creates data table
const messages = [];

/**
 * Initialisation
 */
client.on('ready', () => {
	winston.info('Bot Discord: I am ready!');
});

/**
 * Réaction aux messages sur Discord
 */
// client.on('message', message => {
//
// 	// Commandes bot
// 	if (message.content.indexOf('!commands') === 0) {
// 		message.reply("Liste des commandes:\n!ts");
// 	} else if (message.content.indexOf('!ts') === 0) {
// 		// TODO: check permission
// 		message.author.send("Adresse du TS: 198.257.241.25:8145 - Mot de passe: va-te-faire-foutre");
// 	}
//
// });

// log our bot in
client.login(APP_TOKEN).catch(err => {
	winston.error(err);
});

/**
 * API
 */
exports = module.exports = {
	
	getChannelBN: () => CHANNEL_WRITE,

	sendMessage: (message, options) => {
		let promise;
		client.channels.forEach(channel => {
			if (channel.name === CHANNEL_WRITE) {
				promise = channel.send(message, options);
			}
		});
		return promise || new Promise((resolve, reject) => resolve());
	},

	getOnlineUsers: () => {
		const users = [];
		client.users.forEach(user => {
			if (user.presence.status !== "offline")
				users.push(user);
		});
		users.sort((a, b) => a.username.toUpperCase() > b.username.toUpperCase());
		return users;
	},

	getLatestMessages: () => {
		let promise;
		client.channels.forEach(channel => {
			if (channel.name === CHANNEL_NAME) {
				promise = channel.fetchMessages({limit: 50});
			}
		});
		return promise || new Promise((resolve, reject) => resolve([]));
	},

	getLatestAnnouncement: () => {
		let promise;
		client.channels.forEach(channel => {
			if (channel.name === CHANNEL_ANOUNCEMENT) {
				promise = channel.fetchMessages({limit: 10});
			}
		});
		return promise || new Promise((resolve, reject) => resolve([]));
	},

	sendPrivateMessage: (target, message, options) => {
		let user;
		client.users.forEach(u => {
			if (u.username + '#' + u.discriminator === target)
				user = u;
		});
		if (user) {
			return user.send(message, options);
		}
	},
};
