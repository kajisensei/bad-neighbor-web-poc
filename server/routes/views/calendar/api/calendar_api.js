const keystone = require('keystone');
const GridFS = require("../../../../gridfs/GridFS.js");
const CalendarEntry = keystone.list('CalendarEntry');
const bcrypt = require('bcrypt');

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
		
		if(data.groups && data.groups.length) {
			query.groups = data.groups;
		}

		const entry = new CalendarEntry.model(query);
		entry._req_user = user;
		entry.save((err, entry) => {
			if (err) return res.status(500).send({error: err.message});

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
