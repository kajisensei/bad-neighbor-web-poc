const keystone = require('keystone');
const GridFS = require("../../../gridfs/GridFS.js");
const ForumTopic = keystone.list('ForumTopic');
const ForumMessage = keystone.list('ForumMessage');


const API = {

	/*
	 * Publication de post
	 */

	publish: (req, reqObject, res) => {
		const data = req.body;
		const locals = res.locals;
		const image = req.files.file;

		// Checks
		if (!locals.rightKeysSet || !locals.rightKeysSet.has("forum-articles")) {
			return res.status(403).send({error: "You don't have the right to do this."});
		}
		if (!data || !data.topicKey) {
			return res.status(500).send({error: "Missing data or topicKey in data."});
		}

		// Get message in DB
		ForumTopic.model.update({
			key: data.topicKey
		}, {
			["publish.date"]: new Date(),
			["publish.title"]: data.title,
			["publish.summary"]: data.summary,
			["publish.type"]: data.type,
			["publish.category"]: data.category,
		}, (err, result) => {
			if (err)
				return res.status(500).send({error: "Error fetching data."});
			if (!result || result.n === 0)
				return res.status(200).send({error: "Unknown topic Key: " + data.topicKey});

			// On sauvegarde l'image
			image.filename = "article-" + data.topicKey;

			GridFS.add(req.files.file, (err, id) => {
				if (err) {
					console.log(err);
					return res.status(500).send({error: "Unable to upload article image."});
				}

				// TODO: place flash
				return res.status(200).send({});
			});

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
