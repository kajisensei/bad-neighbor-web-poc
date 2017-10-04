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
const showdown = require('showdown');
const xss = require('xss');
const converter = new showdown.Converter();

exports = module.exports = function (req, res) {

	let view = new keystone.View(req, res);
	let locals = res.locals;

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
			queries.push(User.model.find({}).sort({username: 1}).select("username key _id").exec().then(users => {
				locals.users = users;
			}));
		}

		// Tous les évènements auxquel l'utilisateur a accès
		{
			let queryStructure;
			// The query differs if the user is connected or not, admin or not.
			if (locals.user) {
				if(locals.rightKeysSet.has("calendar-admin")) {
					queryStructure = {};
				} else {
					// TODO: invite by group
					queryStructure = {
						$or: [
							{'public': true},
							{'invitations': locals.user._id}
						]
					};
				}
			} else {
				queryStructure = {'public': true};
			}

			queries.push(CalendarEntry.model.find(queryStructure)
				.populate("invitations groups", "name username key")
				.exec().then((result) => {
				const calendarEntryFormatter = pug.compileFile('server/templates/views/calendar/calendar_details.pug');
				locals.data = [];
				let i = 1;
				for (let dbEntry of result) {
					locals.data.push({
						id: i,
						real_id: dbEntry.id,
						text: dbEntry.title,
						html: calendarEntryFormatter({entry: dbEntry, content: xss(converter.makeHtml(dbEntry.text)), dateformat: locals.dateformat}),
						start_date: dateFormat(dbEntry.startDate, "mm/dd/yyyy HH:MM"),
						end_date: dateFormat(dbEntry.endDate, "mm/dd/yyyy HH:MM"),
					});
					i = i + 1;
				}
			}));
		}

		Promise.all(queries).then(() => {
			next();
		}).catch(err => {
			res.err(err, err.name, err.message);
		});

	});

	view.render('calendar/calendar');
};
