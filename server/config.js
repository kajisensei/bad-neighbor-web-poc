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
showdown.setOption('simpleLineBreaks', true);
showdown.setOption('openLinksInNewWindow', true);
showdown.setOption('ghMentions', true);
showdown.setOption('ghMentionsLink', "/member/{u}");
showdown.setOption('tables', true);
showdown.setOption('parseImgDimensions', true);

// Ajouter la classe table à chaque table
showdown.extension('tableExt', function () {
	return [{
		type: "output",
		filter: function (html, converter, options) {
			return html.replace("<table>", "<table class='table table-striped table-bordered'>");
		}
	}];
});

const xss = require('xss');
xss.whiteList.table.push('class');

// Load Discord bot
// require('./apps/DiscordBot');
