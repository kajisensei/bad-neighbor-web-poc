const keystone = require('keystone');
const CalendarEntry = keystone.list('CalendarEntry');
const User = keystone.list('User');
const discord = require("./../../../../apps/DiscordBot.js");
const activityLogger = require('winston').loggers.get('activity');

const getQuery = (data) => {
	const query = {
		['title']: data.title,
		['text']: data.description,
		['startDate']: data.startDate,
		['endDate']: data.endDate,
		['public']: data.public,
		// ['open']: data.open,
	};
	query.invitations = data.users || [];

	if (data.groups && data.groups.length) {
		query.groups = data.groups;
	}

	return query;
};

const API = {

	/*
	 * Add event
	 */

	addEvent: (req, reqObject, res) => {
		const data = req.body;
		const locals = res.locals;
		const user = locals.user;

		if (!user) {
			return res.status(200).send({error: "Vous n'êtes pas authentifié."});
		}

		const query = getQuery(data);

		const entry = new CalendarEntry.model(query);
		entry._req_user = user;
		entry.save((err, entry) => {
			if (err) return res.status(500).send({error: err.message});

			activityLogger.info(`Calendrier: nouvel event par ${user.username}: ${data.title}.`);

			// Notifier sur Discord si l'option est cochée
			if (data.discord) {
				discord.sendMessage(`Nouvel événement par ${req.user.username}: "${data.title}"`, {
					embed: {
						title: `Événement: ${data.title}"`,
						description: `Cet événement est public.\nLe ${locals.dateformat(data.startDate, "d mmm yyyy à HH:MM")}`,
						url: process.env.BASE_URL + '/calendar?open=' + entry._id,
						author: {
							name: req.user.username,
							url: process.env.BASE_URL + '/member/' + req.user.key,
							icon_url: process.env.BASE_URL + `/images/avatar-${req.user.key}?default=avatar`
						}
					}
				});
			}

			// Notifier par MP sur Discord les invités directs
			User.model.find({
				$or: [
					{_id: {$in: query.invitations || []}},
					{["permissions.groups"]: {$in: query.groups || []}}
				]
			}).select("personnal.discord").exec((err, users) => {
				if (err) return console.log(err);

				users.forEach(user => {
					if (user.personnal && user.personnal.discord) {
						discord.sendPrivateMessage(user.personnal.discord, `Invitation à un événement par ${req.user.username}`, {
							embed: {
								title: `Événement: "${data.title}"`,
								description: `Vous êtes invité à l'événement "${data.title}"\nLe ${locals.dateformat(data.startDate, "d mmm yyyy à HH:MM")}`,
								url: process.env.BASE_URL + '/calendar?open=' + entry._id,
							}
						});
					}
				});
			});

			req.flash('success', "Évènement créé.");
			return res.status(200).send({});

		});
	},

	/*
	 * Remove event
	 */

	removeEvent: (req, reqObject, res) => {
		const data = req.body;
		const locals = res.locals;
		const user = locals.user;

		if (!user) {
			return res.status(200).send({error: "Vous n'êtes pas authentifié."});
		}

		//TODO: vérifier qu'il a le droit (admin ou c'est son évènement)
		//TODO: notifié les inscrits

		CalendarEntry.model.remove({
			_id: data.eventId
		}).exec(err => {
			if (err) return res.status(500).send({error: err.message});
			activityLogger.info(`Calendrier: event supprimé par ${user.username}: ${data.eventId}.`);
			req.flash('success', "Évènement supprimé.");
			return res.status(200).send({});
		});
	},

	editEvent: (req, reqObject, res) => {
		const data = req.body;
		const locals = res.locals;
		const user = locals.user;

		if (!user) {
			return res.status(200).send({error: "Vous n'êtes pas authentifié."});
		}

		//TODO: vérifier qu'il a le droit (admin ou c'est son évènement)
		//TODO: notifié les inscrits

		const editQuery = getQuery(data);

		CalendarEntry.model.update({_id: data.id}, editQuery, err => {
			if (err)
				return res.status(500).send({error: "Error during edit:" + err});

			activityLogger.info(`Calendrier: event modifié par ${user.username}: ${data.title}.`);
			req.flash('success', 'Événement modifié');
			res.status(200).send({});
		});
	},

	statut: (req, reqObject, res) => {
		const data = req.body;
		const locals = res.locals;
		const user = locals.user;

		if (!user) {
			return res.status(200).send({error: "Vous n'êtes pas authentifié."});
		}

		//TODO: vérifier qu'il a le droit (il a accès à l'event)
		
		const editQuery = {};
		if (data.actionType === "maybe") {
			editQuery["$pull"] = {
				away: user._id,
				present: user._id,
			};
			editQuery["$addToSet"] = {
				maybe: user._id,
			};
		} else if (data.actionType === "away") {
			editQuery["$pull"] = {
				present: user._id,
				maybe: user._id,
			};
			editQuery["$addToSet"] = {
				away: user._id,
			};
		} else if (data.actionType === "present") {
			editQuery["$pull"] = {
				away: user._id,
				maybe: user._id,
			};
			editQuery["$addToSet"] = {
				present: user._id,
			};
		} else {
			return res.status(500).send({error: "Unknown statut type:" + data.actionType});
		}

		CalendarEntry.model.update({_id: data.eventId}, editQuery, err => {
			if (err) {
				return res.status(500).send({error: "Error during statut edit:" + err});
			}

			activityLogger.info(`Calendrier: statut modifié pour ${user.username}: ${data.actionType}.`);
			req.flash('success', 'Statut modifié');
			res.status(200).send({});
		});

	}

};


exports = module.exports = (req, res) => {
	const action = req.params['action'];

	if (API[action]) {
		try {
			API[action](req, req.body, res);
		} catch (err) {
			console.log(err);
			res.status(500).send({error: "Error in action: " + action});
		}
	} else {
		res.status(500).send({error: "Method not found: No method for action: " + action});
	}
};
