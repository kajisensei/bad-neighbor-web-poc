/**
 * Created by Syl on 21-04-17.
 */
const keystone = require('keystone');
const Promise = require("bluebird");
const dateFormat = require('dateformat');
const pug = require('pug');
const CalendarEntry = keystone.list('CalendarEntry');
const UserGroup = keystone.list('UserGroup');
const User = keystone.list('User');
const textUtils = require("../../textUtils.js");

exports = module.exports = function (req, res) {

	let view = new keystone.View(req, res);
	let locals = res.locals;
	const isAgenda = req.query["toAgenda"];

	// Set locals
	locals.section = 'calendar';

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
				.populate("invitations groups createdBy updatedBy", "name username key isBN color")
				.exec().then((result) => {
					// TODO: compile once or format it client side ?
					const calendarEntryFormatter = pug.compileFile('server/templates/views/calendar/calendar_details.pug');
					// TODO: compile once or format it client side ?
					const calendarTooltipFormatter = pug.compileFile('server/templates/views/calendar/calendar_tooltip.pug');
					locals.data = [];
					for (let dbEntry of result) {
						locals.data.push({
							id: locals.data.length + 1,
							real_id: dbEntry.id,
							text: dbEntry.title,
							dbEntry: dbEntry,
							mine: locals.user && String(dbEntry.createdBy._id) === String(locals.user._id),
							html: calendarEntryFormatter({
								entry: dbEntry,
								content: textUtils.markdownize(dbEntry.text),
								dateformat: locals.dateformat
							}),
							tooltip: calendarTooltipFormatter({
								entry: dbEntry,
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
			if(!isAgenda) {
				locals.users.forEach(user => {
					if (user.personnal && user.personnal.birthday) {
						const date = user.personnal.birthday;
						locals.data.push({
							id: locals.data.length + 1,
							text: `🎂 ${user.username}`,
							html: "",
							start_date: dateFormat(new Date(new Date().getFullYear(), date.getMonth(), date.getDate(), 0, 0), "mm/dd/yyyy HH:MM"),
							end_date: dateFormat(new Date(new Date().getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0), "mm/dd/yyyy HH:MM"),
							isBirthday: true,
						});
						locals.data.push({
							id: locals.data.length + 1,
							text: `🎂 ${user.username}`,
							html: "",
							start_date: dateFormat(new Date(new Date().getFullYear() + 1, date.getMonth(), date.getDate(), 0, 0), "mm/dd/yyyy HH:MM"),
							end_date: dateFormat(new Date(new Date().getFullYear() + 1, date.getMonth(), date.getDate() + 1, 0, 0), "mm/dd/yyyy HH:MM"),
							isBirthday: true,
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
