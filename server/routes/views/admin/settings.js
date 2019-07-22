/**
 * Created by Syl on 21-04-17.
 */
const keystone = require('keystone');
const discord = require('./../../../apps/DiscordBot.js');

exports = module.exports = function (req, res) {

	let view = new keystone.View(req, res);
	let locals = res.locals;

	// Set locals
	locals.section = 'settings';

	// Load entries
	view.on('init', function (next) {
		locals.discordLogs = discord.getLogs();
		next();
	});

	view.render('admin/settings');
};
