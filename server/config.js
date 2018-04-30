/**
 * Created by Syl on 05-05-17.
 */

// Mongoose Promise to use bluebird
require('mongoose').Promise = require('bluebird');

// Logger config
const winston = require('winston');
require('winston-mongodb');
winston.configure({
	transports: [
		new (winston.transports.Console)({
			colorize: true,
			level: process.env.LOGGER_LEVEL || 'info'
		})
	]
});
winston.loggers.add('activity', {
	console: {
		level: 'info',
		colorize: true,
		label: 'Activity logger'
	}
});
const activityLogger = winston.loggers.get('activity');
activityLogger.add(winston.transports.MongoDB, {
	level: 'info',
	db: process.env.MONGO_URI || "mongodb://localhost/bad-website",
	collection: 'ksjs_logs',
	tryReconnect: true
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
			return html.replace(/<table>/g, "<table class='table table-striped table-bordered'>");
		}
	}];
});

const xss = require('xss');
xss.whiteList.table.push('class');
