/**
 * Created by Cossement Sylvain on 25-04-17.
 */

/*
 A ping pong bot, whenever you send "ping", it replies "pong".
 */

// import the discord.js module
const discord = require('discord.js');
const winston = require('winston');

// create an instance of a Discord Client, and call it bot
const bot = new discord.Client();

// the token of your bot - https://discordapp.com/developers/applications/me
const token = 'MzA2NTEzODMyNTAxNTc1Njgx.C-E8EQ.jDyAIXO2Yc8kVowItu1jF7dEzIs';

// Creates data table
const messages = [];

// the ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted.
bot.on('ready', () => {
	winston.info('Bot Discord: I am ready!');
	winston.error('Some error !');
});

// create an event listener for messages
bot.on('message', message => {

	messages.push({
		content: message.content,
		author: message.author.username,
		createdAt: new Date()
	});
	
	if(messages.length > 10) {
		messages.shift();
	}

});

exports = module.exports = {
	data: messages
};

// log our bot in
bot.login(token);
