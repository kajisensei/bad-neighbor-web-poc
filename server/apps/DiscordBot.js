/**
 * Created by Cossement Sylvain on 25-04-17.
 */

const discord = require('discord.js');
const winston = require('winston');
const keystone = require('keystone');
const User = keystone.list('User');
const dateFormat = require('dateformat');

const APP_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_NAME = process.env.DISCORD_CHANNEL || "general";
const CHANNEL_WRITE = process.env.DISCORD_CHANNEL_WRITE || "annonces-site";
const CHANNEL_ANOUNCEMENT = process.env.DISCORD_CHANNEL_ANOUNCEMENT || process.env.DISCORD_CHANNEL || "annonces-officielles";

/**
 * Initialisation
 */

let client;
const logs = [];

const createClient = () => {
	if (!client) {
		winston.info(`Bot Discord: Creating client.`);

		client = new discord.Client();
		client.on('ready', () => {
			winston.info('Bot Discord: I am ready!');
			if (logs.length > 20) {
				logs.shift()
			}
			logs.push(`Ready at ${dateFormat(new Date(), "mm/dd/yyyy HH:MM:ss")}`);
		});
		client.on('disconnect', () => {
			winston.warn('Bot Discord: Disconnected');
			if (logs.length > 20) {
				logs.shift()
			}
			logs.push(`Disconnect at ${dateFormat(new Date(), "mm/dd/yyyy HH:MM:ss")}`);
		});
		client.on('error', error => {
			winston.error('Bot Discord: error', error);
			if (logs.length > 20) {
				logs.shift()
			}
			logs.push(`Error at ${dateFormat(new Date(), "mm/dd/yyyy HH:MM:ss")}`);
		});

		// log our bot in
		client.login(APP_TOKEN).catch(err => {
			winston.error(err);
		});
	} else {
		winston.warn(`Bot Discord: I can't create because already exists.`);
	}
};

const recreateClient = () => {
	if (client) {
		winston.info(`Bot Discord: Destroying...`);
		const old = client;
		client = null;
		old.destroy().then(() => {
			winston.info(`Bot Discord: Destroyed.`);
			createClient();
		});
	} else {
		createClient();
	}
};

recreateClient();


const sendPrivateMessage = (target, message, options) => {
	let user;
	client.users.forEach(u => {
		if (u.username + '#' + u.discriminator === target)
			user = u;
	});
	if (user) {
		return user.send(message, options);
	}
};

/**
 * API
 */
exports = module.exports = {

	getChannelBN: () => CHANNEL_WRITE,

	getLogs: () => logs,

	recreateClient: recreateClient,

	sendMessage: (message, options) => {
		let promise = null;
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

	getUserPresence: (target) => {
		let user;
		client.users.forEach(u => {
			if (u.username + '#' + u.discriminator === target) {
				user = u;
			}
		});
		if (user) {
			return user.presence;
		}
	},

	getLatestMessages: () => {
		let promise = null;
		client.channels.forEach(channel => {
			if (channel.name === CHANNEL_NAME) {
				promise = channel.fetchMessages({limit: 50});
			}
		});
		return promise || new Promise((resolve, reject) => resolve([]));
	},

	getLatestAnnouncement: () => {
		let promise = null;
		client.channels.forEach(channel => {
			if (channel.name === CHANNEL_ANOUNCEMENT) {
				promise = channel.fetchMessages({limit: 10});
			}
		});
		return promise || new Promise((resolve, reject) => resolve([]));
	},

	sendPrivateMessage: sendPrivateMessage,

	mentions: (message, url, byName, topicName) => {
		const pattern = /\B@[a-z0-9_-]+/gi;
		const mentions = message.match(pattern);
		const usernames = [];
		if (mentions && mentions.length) {
			mentions.forEach(mention => {
				const username = mention.substring(1);
				usernames.push(username);
			});
			User.model.find({
				key: {$in: usernames},
			}).select("personnal.discord").exec((err, users) => {
				if (err) {
					winston.warn(`Unable to get users for mentions.`);
					return;
				}

				users.forEach(user => {
					if (user.personnal && user.personnal.discord) {
						sendPrivateMessage(user.personnal.discord,
							`Vous avez été mentionné par ${byName} dans le sujet "${topicName}".`,
							{
								embed: {
									title: `Mentionné dans: "${topicName}"`,
									url: process.env.BASE_URL + url,
								}
							});
					}
				});

			});
		}
	},
};
