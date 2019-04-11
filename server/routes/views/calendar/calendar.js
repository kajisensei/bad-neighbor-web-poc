/**
 * Created by Syl on 21-04-17.
 */
const keystone = require('keystone');
const moment = require('moment');
const Promise = require("bluebird");
const dateFormat = require('dateformat');
const pug = require('pug');
const CalendarEntry = keystone.list('CalendarEntry');
const UserGroup = keystone.list('UserGroup');
const User = keystone.list('User');
const Forum = keystone.list('Forum');
const discord = require("./../../../apps/DiscordBot.js");
const textUtils = require("../../textUtils.js");
const xss = require('xss');

const calendarEntryFormatter = pug.compileFile('server/templates/views/calendar/calendar_details.pug');
const calendarTooltipFormatter = pug.compileFile('server/templates/views/calendar/calendar_tooltip.pug');

const getStatut = (event, user) => {
	if (!user) {
		return;
	}
	const userId = String(user._id);
	for (let id of event.present) {
		if (String(id._id) === userId) {
			return "present";
		}
	}
	for (let id of event.away) {
		if (String(id._id) === userId) {
			return "away";
		}
	}
	for (let id of event.maybe) {
		if (String(id._id) === userId) {
			return "maybe";
		}
	}
	return "";
};

const getStatutBall = (event, user) => {
	if (!user) {
		return "";
	}
	const status = getStatut(event, user);
	if (status === "present") {
		return "<i class=\"fas fa-check\" style='color: #5cb85c;'></i> ";
	}
	if (status === "away") {
		return "<i class=\"fas fa-times\" style='color: #d9534f;'></i> ";
	}
	if (status === "maybe") {
		return "<i class=\"far fa-question-circle\" style='color: #f0ad4e;'></i> ";
	}
	return "<i class=\"fas fa-ellipsis-h\" style='color: grey;'></i> ";
};

exports = module.exports = function (req, res) {

	let view = new keystone.View(req, res);
	let locals = res.locals;
	const user = locals.user;
	const isAgenda = req.query["toAgenda"];

	// Set locals
	locals.section = 'calendar';
	locals.isAgenda = isAgenda;
	locals.channel_bn = discord.getChannelBN();

	// Load entries
	view.on('init', function (next) {

		const queries = [];

		// Liste des groupes pour popup création/édition
		{
			queries.push(UserGroup.model.find({}).sort({name: 1}).select("name key _id color").exec().then(groups => {
				locals.groups = groups;
			}));
		}

		// Liste des utilisateurs pour popup création/édition
		{
			queries.push(User.model.find({}).sort({username: 1}).select("username key _id personnal.birthday").exec().then(users => {
				locals.users = users;
			}));
		}

		// Liste des forums avec droit de création de sujet
		if (user) {
			queries.push(Forum.model
				.find({
					["$and"]: [
						{
							["$or"]: [
								{read: []},
								{read: {$in: user.permissions.groups}}
							]
						},
						{
							["$or"]: [
								{write: []},
								{write: {$in: user.permissions.groups}}
							]
						}
					]
				})
				.sort({order: 1})
				.select("name group")
				.exec()
				.then(forums => {
					locals.forums = forums;
				}));
		}

		// Tous les évènements auxquel l'utilisateur a accès
		{
			let queryStructure = {};
			// The query differs if the user is connected or not, admin or not.
			if (locals.user) {
				queryStructure = {
					$or: [
						{'public': true},
						{'invitations': locals.user._id},
						{'createdBy': locals.user._id},
						{'groups': {$in: [...locals.groupsId]}}
					]
				};
			} else {
				queryStructure = {'public': true};
			}

			queries.push(CalendarEntry.model.find(queryStructure)
				.populate("invitations groups createdBy updatedBy present away maybe", "name username key isBN color")
				.exec().then((result) => {
					locals.data = [];
					for (let dbEntry of result) {
						const status = getStatut(dbEntry, locals.user);
						locals.data.push({
							id: locals.data.length + 1,
							real_id: dbEntry.id,
							text: getStatutBall(dbEntry, locals.user) + xss(dbEntry.title),
							dbEntry: dbEntry,
							mine: locals.user && String(dbEntry.createdBy._id) === String(locals.user._id),
							html: calendarEntryFormatter({
								entry: dbEntry,
								status: status,
								content: textUtils.markdownize(dbEntry.text),
								dateformat: locals.dateformat
							}),
							tooltip: calendarTooltipFormatter({
								entry: dbEntry,
								status: status,
								content: textUtils.markdownize(dbEntry.text),
								dateformat: locals.dateformat
							}),
							start_date: dateFormat(dbEntry.startDate, "mm/dd/yyyy HH:MM"),
							end_date: dateFormat(dbEntry.endDate, "mm/dd/yyyy HH:MM"),
						});
					}
				}));
		}

		Promise.all(queries).then(() => {

			// Add a calendar entry for each birthday for the current year and the next.
			if (!isAgenda) {
				locals.users.forEach(user => {
					if (user.personnal && user.personnal.birthday) {
						const date = user.personnal.birthday;
						locals.data.push({
							id: locals.data.length + 1,
							text: `🎂 ${xss(user.username)}`,
							html: "",
							start_date: dateFormat(new Date(new Date().getFullYear(), date.getMonth(), date.getDate(), 0, 0), "mm/dd/yyyy HH:MM"),
							end_date: dateFormat(new Date(new Date().getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0), "mm/dd/yyyy HH:MM"),
							isBirthday: date,
						});
						locals.data.push({
							id: locals.data.length + 1,
							text: `🎂 ${xss(user.username)}`,
							html: "",
							start_date: dateFormat(new Date(new Date().getFullYear() + 1, date.getMonth(), date.getDate(), 0, 0), "mm/dd/yyyy HH:MM"),
							end_date: dateFormat(new Date(new Date().getFullYear() + 1, date.getMonth(), date.getDate() + 1, 0, 0), "mm/dd/yyyy HH:MM"),
							isBirthday: date,
						});
					}
				});
			}

			next();
		}).catch(err => {
			res.err(err, err.name, err.message);
		});

	});

	view.render('calendar/calendar');
};
