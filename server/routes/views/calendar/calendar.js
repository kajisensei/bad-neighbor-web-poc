/**
 * Created by Syl on 21-04-17.
 */
const keystone = require('keystone');
const dateFormat = require('dateformat');
const pug = require('pug');
const CalendarEntry = keystone.list('CalendarEntry');
const showdown = require('showdown');
const xss = require('xss');
const converter = new showdown.Converter();

exports = module.exports = function (req, res) {

	let view = new keystone.View(req, res);
	let locals = res.locals;

	// Set locals
	locals.section = 'calendar';

	let queryStructure;
	// The query differs if the user is connected or not.
	if (locals.user) {
		queryStructure = {
			$or: [
				{'public': true},
				{'invitations': locals.user._id}
			]
		};
	} else {
		queryStructure = {'public': true};
	}

	// Load entries
	view.on('init', function (next) {

		let q = CalendarEntry.model.find(queryStructure).populate("invitations", "username key");

		q.exec(function (err, result) {
			if (err) {
				res.err(err, err.name, err.message);
				return;
			}

			const calendarEntryFormatter = pug.compileFile('server/templates/views/calendar/calendarDetails.pug');
			locals.data = [];
			let i = 1;
			for (let dbEntry of result) {
				locals.data.push({
					id: i,
					real_id: dbEntry.id,
					text: dbEntry.title,
					html: calendarEntryFormatter({entry: dbEntry, content: xss(converter.makeHtml(dbEntry.text))}),
					start_date: dateFormat(dbEntry.startDate, "mm/dd/yyyy HH:MM"),
					end_date: dateFormat(dbEntry.endDate, "mm/dd/yyyy HH:MM"),
				});
				i = i + 1;
			}

			next();
		});

	});

	view.render('calendar/calendar');
};
