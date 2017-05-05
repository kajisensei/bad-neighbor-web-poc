/**
 * Created by Syl on 05-05-17.
 */

// Mongoose Promise to use bluebird
require('mongoose').Promise = require('bluebird');

// Logger config
const winston = require('winston');
winston.configure({
	transports: [
		new (winston.transports.Console)({
			colorize: true,
			level: 'info'
		}),
		new (winston.transports.File)({
			name: 'error-file',
			filename: 'filelog-error.log',
			level: 'error'
		})
	]
});

// Markdown configuration
const showdown = require("showdown");
showdown.setOption('simpleLineBreaks', false);
showdown.setOption('openLinksInNewWindow', true);
showdown.setOption('ghMentions', true);
showdown.setOption('ghMentionsLink', "/members/{u}");

// Load Discord bot
require('./apps/DiscordBot');
