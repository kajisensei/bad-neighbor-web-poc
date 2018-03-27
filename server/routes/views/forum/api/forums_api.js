const keystone = require('keystone');
const User = keystone.list('User');
const ForumTopic = keystone.list('ForumTopic');
const winston = require('winston');

const API = {

	/*
	 * Marks all forums read
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
			if(err)
				winston.warn(`Failed to cleanup mark-all-read for user ${user.username}: ${JSON.stringify(err)}`);
		});

	},

	/*
	 * Marks one forum read
	 */
	["forum-mark-all-read"]: (req, reqObject, res) => {
		const data = req.body;
		const locals = res.locals;
		const user = locals.user;

		if (!user)
			return;
		
		const forumId = data.forumId;
		
		ForumTopic.model.update({
			forum: forumId
		}, {
			$addToSet: {views: user._id}
		}, {
			multi: true
		}).exec(err => {
			if (err) return res.err(err, err.name, err.message);
			req.flash('success', "Tous les sujets de ce forum marqués comme lus");
			res.status(200).send({});
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
