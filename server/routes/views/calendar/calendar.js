/**
 * Created by Syl on 21-04-17.
 */
const keystone = require('keystone');
const dateFormat = require('dateformat');
const assert = require('assert');
const pug = require('pug');
let CalendarEntry = keystone.list('CalendarEntry');

const calendarEntryFormatter = pug.compileFile('server/templates/views/calendar/calendarDetails.pug');

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

			locals.data = [];
			let i = 1;
			for (let dbEntry of result) {
				locals.data.push({
					id: i,
					text: calendarEntryFormatter(dbEntry),
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
