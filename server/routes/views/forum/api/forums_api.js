const keystone = require('keystone');
const GridFS = require("../../../../gridfs/GridFS.js");
const User = keystone.list('User');
const Forum = keystone.list('Forum');
const ForumTopic = keystone.list('ForumTopic');
const ForumMessage = keystone.list('ForumMessage');
const winston = require('winston');

const API = {

	/*
	 * Marks all forum read
	 */
	["mark-all-read"]: (req, reqObject, res) => {
		const data = req.body;
		const locals = res.locals;
		const user = locals.user;

		if (!user)
			return;

		User.model.update({
			_id: user.id
		}, {
			readDate: new Date()
		}).exec((err) => {
			if (err) return res.err(err, err.name, err.message);
			req.flash('success', "Tous les forums marqués comme lus");
			res.status(200).send({});
		});

		// Cleanup en background
		ForumTopic.model.update({}, {
			$pull: {views: user.id}
		}, {
			multi: true
		}).exec(err => {
			winston.warn(`Failed to cleanup mark-all-read for user ${user.username}`);
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
