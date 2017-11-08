const keystone = require('keystone');
const GridFS = require("../../../../gridfs/GridFS.js");
const User = keystone.list('User');
const Forum = keystone.list('Forum');
const ForumTopic = keystone.list('ForumTopic');
const ForumMessage = keystone.list('ForumMessage');
const textUtils = require("../../../textUtils.js");

const API = {

	/*
	 * Create message
	 */
	["create"]: (req, reqObject, res) => {
		const data = req.body;
		const locals = res.locals;

		// TODO: check permissions + verifier que topic existe + QUE C'EST PAS LOCK
		if (!data || !data.topic)
			return res.status(500).send({error: "Missing data or data arguments:"});

		// On créer le message
		const newMessage = new ForumMessage.model({
			content: data.content,
			author: req.user.username,
			topic: data.topic,
			author_ip: req.connection.remoteAddress
		});
		newMessage._req_user = req.user;
		newMessage.save((err, message) => {
			if (err) return res.status(500).send({error: "Error during message creation:" + err});

			// Ajouter le dernier message en lien direct au topic et on incrémente son compteur de reply
			ForumTopic.model.update({
				_id: data.topic
			}, {
				last: message.id,
				updatedAt: new Date(),
				views: [req.user._id],
				$inc: {'stats.replies': 1}
			}).exec(err => {
				if (err) return res.status(500).send({error: "Error during topic MD adaptation:" + err});

				// Incremente le compteur de post
				User.model.update({_id: req.user.id}, {$inc: {'posts': 1}}, err => {
					res.status(200).send({});
				});
			});

		});

	},

	/*
	 * Remove message
	 */
	["remove"]: (req, reqObject, res) => {
		const data = req.body;
		const locals = res.locals;

		// TODO: check permission moderation

		// Find message and topic
		ForumMessage.model.findOne({_id: data.id}).populate("topic")
			.exec((err, message) => {
				if (err || !message)
					return res.status(500).send({error: "Error finding message."});

				// Remove message
				ForumMessage.model.remove({_id: message.id}).exec((err) => {
					if (err)
						return res.status(500).send({error: "Error removing message."});

					// Recalculer le dernier message du topic
					ForumMessage.model.findOne({topic: message.topic.id}).select("id createdBy").sort({createdAt: -1})
						.exec((err, last) => {
							if (err || !last)
								return res.status(500).send({error: "Topic has no message left: " + message.topic.key});

							ForumTopic.model.update({_id: message.topic.id}, {
								last: last.id,
								$inc: {'stats.replies': -1}
							}, (err) => {
								if (err || !last)
									return res.status(500).send({error: "Error adapting topic last message: " + message.topic.key});

								// Decremente le compteur de post
								User.model.update({_id: message.createdBy}, {$inc: {'posts': -1}}, err => {
									req.flash('success', 'Message supprimé');
									res.status(200).send({});
								});

							});

						});

				});
			});
	},

	/*
	 * Update message
	 */
	["update"]: (req, reqObject, res) => {
		const data = req.body;
		const locals = res.locals;

		// Find message and topic
		ForumMessage.model.findOne({_id: data.id})
			.exec((err, message) => {
				if (err || !message)
					return res.status(500).send({error: "Error finding message."});

				// TODO: check permission moderation or author (populate recursif jusqu'au forum ?)

				message.updatedBy = req.user._id;
				message.content = data.content || "";
				message.save(err => {
					if (err)
						return res.status(500).send({error: "Error updating message."});

					res.status(200).send({});
				});

			});
	},


	/*
	 * Markdown preview
	 */
	["preview"]: (req, reqObject, res) => {
		const data = req.body;
		return res.status(200).send({markdown: textUtils.markdownize(data.raw)});
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
