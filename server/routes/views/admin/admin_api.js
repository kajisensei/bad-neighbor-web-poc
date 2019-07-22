const activityLogger = require('winston').loggers.get('activity');
const discord = require("./../../../apps/DiscordBot.js");

const API = {

	/*
	 * Update page
	 */

	"restart-discord": (req, res) => {
		const locals = res.locals;
		const user = locals.user;
		discord.recreateClient();
		activityLogger.info(`Groberts redémarré par ${user.username}.`);
		res.status(200).json({}).end();
	},

};


exports = module.exports = (req, res) => {
	const action = req.params['action'];

	if (API[action]) {
		try {
			API[action](req, res);
		} catch (err) {
			console.log(err);
			res.status(500).send({error: "Error in action: " + action});
		}
	} else {
		res.status(500).send({error: "Method not found: No method for action: " + action});
	}
};
