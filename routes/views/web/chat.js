const keystone = require('keystone');
const DiscordBot = require("../../apps/DiscordBot");

exports = module.exports = function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	// Toujours associer une section pour correctement colorer le menu.
	locals.section = 'chat';

	view.on("init", next => {

		locals.mess = DiscordBot.data;
		next();
		
	});

	// Render the view
	view.render('web/chat');
};
