const keystone = require('keystone');
const CalendarEntry = keystone.list('CalendarEntry');
const User = keystone.list('User');
const discord = require("./../../../../apps/DiscordBot.js");
const activityLogger = require('winston').loggers.get('activity');
const pug = require('pug');
const textUtils = require("../../../textUtils.js");
const calendarFrameFormatter = pug.compileFile('server/templates/views/calendar/calendar_frame.pug');
const topicAPI = require('../../forum/api/topic_api');

const getQuery = (data) => {
	const query = {
		['title']: data.title,
		['text']: data.description,
		['startDate']: data.startDate,
		['endDate']: data.endDate,
		['public']: data.public,
		['notification']: data.notification,
		['sc']: data.sc,
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
	 * Notify event
	 */

	notifyEvent: (req, reqObject, res) => {
		const data = req.body;
		const locals = res.locals;
		const user = locals.user;

		if (!user) {
			return res.status(200).send({error: "Vous n'êtes pas authentifié."});
		}

		// Notif Discord au créateur si option
		CalendarEntry.model
			.findOne({
				_id: data.eventId
			})
			.select("title startDate createdBy")
			.populate("createdBy", 'username key')
			.exec((err, event) => {
				if (err || !event) {
					winston.warn(`Unable to get event for creator notif on discord [event: ${data.eventId}]`);
					return;
				}

				discord.sendMessage(`Nouvel événement par ${event.createdBy.username}: "${event.title}"`, {
					embed: {
						title: `Événement: ${event.title}"`,
						description: `Le ${locals.dateformat(event.startDate, "d mmm yyyy à HH:MM")}`,
						url: process.env.BASE_URL + '/calendar?open=' + event._id,
						author: {
							name: event.createdBy.username,
							url: process.env.BASE_URL + '/member/' + event.createdBy.key,
							icon_url: process.env.BASE_URL + `/images/avatar-${event.createdBy.key}?default=avatar`
						}
					}
				});

				req.flash('success', "Évènement annoncé sur Discord (si Groberts veut bien travailler).");
				return res.status(200).send({});

			});
	},

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

			// Notifier par MP sur Discord les invités directs
			User.model
				.find({
					$or: [
						{_id: {$in: query.invitations || []}},
						{["permissions.groups"]: {$in: query.groups || []}}
					]
				})
				.select("personnal.discord")
				.exec((err, users) => {
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

			// Création du topic
			if (data.forum) {
				req.body = {
					forum: data.forum,
					title: data.title,
					content: `EVENT[${entry._id}]`
				};
				req.params.action = "create";
				topicAPI(req, res);
				return;
			}

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

		CalendarEntry.model
			.findOne({
				_id: data.eventId
			})
			.select("present maybe title startDate")
			.populate("present maybe", 'personnal.discord')
			.exec((err, entry) => {
				if (err) return console.log(err);

				if (entry) {
					// Notify registered
					if (entry.present) {
						entry.present.forEach(p => {
							if (p.personnal && p.personnal.discord) {
								discord.sendPrivateMessage(user.personnal.discord, `L'événement "${entry.title}" du ${locals.dateformat(entry.startDate, "d mmm yyyy à HH:MM")} pour lequel vous étiez inscrit comme "présent" a été annulé.`, {});
							}
						});
					}
					if (entry.maybe) {
						entry.maybe.forEach(p => {
							if (p.personnal && p.personnal.discord) {
								discord.sendPrivateMessage(user.personnal.discord, `L'événement "${entry.title}" du ${locals.dateformat(entry.startDate, "d mmm yyyy à HH:MM")} pour lequel vous étiez inscrit comme "peut-être" a été annulé.`, {});
							}
						});
					}

					CalendarEntry.model.remove({
						_id: data.eventId
					}).exec(err => {
						if (err) return res.status(500).send({error: err.message});
						activityLogger.info(`Calendrier: event supprimé par ${user.username}: ${data.eventId}.`);
						req.flash('success', "Évènement supprimé.");
						return res.status(200).send({});
					});
				}
			});
	},

	/*
	 * PM event
	 */

	pmEvent: (req, reqObject, res) => {
		const data = req.body;
		const locals = res.locals;
		const user = locals.user;

		if (!user) {
			return res.status(200).send({error: "Vous n'êtes pas authentifié."});
		}

		//TODO: vérifier qu'il a le droit (admin ou c'est son évènement)

		CalendarEntry.model
			.findOne({
				_id: data.eventId
			})
			.select("present maybe title startDate")
			.populate("present maybe", 'personnal.discord')
			.exec((err, entry) => {
				if (err) return console.log(err);

				if (entry) {
					// Notify registered
					if (entry.present) {
						entry.present.forEach(p => {
							if (p.personnal && p.personnal.discord) {
								discord.sendPrivateMessage(user.personnal.discord, `Événement "${entry.title}" du ${locals.dateformat(entry.startDate, "d mmm yyyy à HH:MM")}: Message de l'organisateur:\n${data.message}`, {});
							}
						});
					}
					if (entry.maybe) {
						entry.maybe.forEach(p => {
							if (p.personnal && p.personnal.discord) {
								discord.sendPrivateMessage(user.personnal.discord, `Événement "${entry.title}" du ${locals.dateformat(entry.startDate, "d mmm yyyy à HH:MM")}: Message de l'organisateur:\n${data.message}`, {});
							}
						});
					}

					activityLogger.info(`Calendrier: PM aux inscrits par ${user.username}: ${data.eventId}.`);
					req.flash('success', "Message envoyé aux inscrits.");
					return res.status(200).send({});
				}
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

			// Notif Discord au créateur si option
			CalendarEntry.model.findOne({
				_id: data.eventId
			}).select("createdBy key title notification").populate("createdBy", 'personnal').exec((err, event) => {
				if (err || !event) {
					winston.warn(`Unable to get topic for creator notif on discord [event: ${data.eventId}]`);
					return;
				}

				if (event.notification && event.createdBy && event.createdBy.personnal && event.createdBy.personnal.discord) {
					discord.sendPrivateMessage(event.createdBy.personnal.discord,
						`Événement ${event.title} : Statut modifié pour ${user.username}: '${data.actionType}'`,
						{
							embed: {
								title: `Événement: "${event.title}"`,
								description: `Vous avez activé les notifications pour cet événement. Vous pouvez désactiver les notifications en modifiant votre événement.`,
								url: process.env.BASE_URL + '/calendar?open=' + data.eventId,
							}
						}
					);
				}

			});
		});

	},

	renderFrame: (req, reqObject, res) => {
		const data = req.body;
		const locals = res.locals;

		CalendarEntry.model
			.findOne({_id: data.id})
			.populate("createdBy present away maybe", "name username key isBN color")
			.exec((err, event) => {
				if (err)
					return res.status(200).send({html: `<i>Problème avec l'évènement: ${data.id}</i>`});

				if (!event)
					return res.status(200).send({html: `<i>Évènement introuvable: ${data.id}</i>`});

				locals.entry = event;
				locals.content = textUtils.markdownize(event.text);

				return res.status(200).send({html: calendarFrameFormatter(locals)});
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
