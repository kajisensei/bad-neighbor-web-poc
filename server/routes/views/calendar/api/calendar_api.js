const keystone = require('keystone');
const CalendarEntry = keystone.list('CalendarEntry');
const User = keystone.list('User');
const discord = require("./../../../../apps/DiscordBot.js");

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

		const query = {
			['title']: data.title,
			['text']: data.description,
			['startDate']: data.startDate,
			['endDate']: data.endDate,
			['public']: data.public,
			['open']: data.open,
		};
		query.invitations = data.users || [];

		if (data.groups && data.groups.length) {
			query.groups = data.groups;
		}

		const entry = new CalendarEntry.model(query);
		entry._req_user = user;
		entry.save((err, entry) => {
			if (err) return res.status(500).send({error: err.message});

			if(data.discord) {
				// Notifier publiquement sur Discord si événement public
				if (data.public) {
					discord.sendMessage(`Nouvel événement par ${req.user.username}: "${data.title}"`, {
						embed: {
							title: `Événement: ${data.title}"`,
							description: `Cet événement est public.\nLe ${locals.dateformat(data.startDate, "d mmm yyyy à HH:MM")}`,
							url: process.env.BASE_URL + '/calendar?toAgenda=true',
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
						{_id: {$in: query.invitations}},
						{["permissions.groups"]: {$in: query.groups}}
					]
				}).select("personnal.discord").exec((err, users) => {
					if (err) return console.log(err);

					users.forEach(user => {
						if (user.personnal && user.personnal.discord) {
							discord.sendPrivateMessage(user.personnal.discord, `Invitation à un événement par ${req.user.username}`, {
								embed: {
									title: `Événement: "${data.title}"`,
									description: `Vous êtes invité à l'événement "${data.title}"\nLe ${locals.dateformat(data.startDate, "d mmm yyyy à HH:MM")}`,
									url: process.env.BASE_URL + '/calendar?toAgenda=true'
								}
							});
						}
					});
				});
			}

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

			req.flash('success', "Évènement supprimé.");
			return res.status(200).send({});
		});
	},

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
