/**
 * Created by Syl on 21-04-17.
 */
const keystone = require('keystone');
const User = keystone.list('User');
const discord = require('./../../../apps/DiscordBot.js');

exports = module.exports = function (req, res) {

	let view = new keystone.View(req, res);
	let locals = res.locals;

	// Set locals
	locals.section = 'chat';

	// Load entries
	view.on('init', function (next) {
		locals.users = discord.getOnlineUsers();
		const messagePromise = discord.getLatestMessages();
		messagePromise.then(messages => {
			// console.log(messages);
			locals.mess = [];
			messages.forEach(message => {
				locals.mess.push(message);
			});
			next();
		}).catch(err => {
			res.err(err, err.name, err.message);
		})
	});

	view.render('chat/discord');
};
