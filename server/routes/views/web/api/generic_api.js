const keystone = require('keystone');
const GridFS = require("../../../../gridfs/GridFS.js");
const GenericPage = keystone.list('GenericPage');
const activityLogger = require('winston').loggers.get('activity');

const API = {

	/*
	 * Update page
	 */

	update: (req, res) => {
		const data = req.body;
		const locals = res.locals;
		const user = locals.user;

		if (!user) {
			return res.status(200).send({error: "Vous n'êtes pas authentifié."});
		}

		GenericPage.model.findOne({key: data.section}).exec((err, found) => {
			if (err) return res.status(500).send({error: err.message});

			const onFinish = (err, ok) => {
				if (err) return res.status(500).send({error: err.message});
				activityLogger.info(`Page générique modifiée par ${user.username}: ${data.section}.`);
				req.flash('success', "Page générique modifiée.");
				return res.status(200).send({});
			};

			if (!found) {
				new GenericPage.model({
					['key']: data.section,
					['name']: data.title,
					['contenu']: data.content
				}).save(onFinish);
			} else {
				GenericPage.model.update({key: data.section}, {
					['name']: data.title,
					['contenu']: data.content
				}, onFinish);
			}
		});
	},

	remove: (req, res) => {
		const data = req.body;
		const locals = res.locals;
		const user = locals.user;

		if (!user) {
			return res.status(200).send({error: "Vous n'êtes pas authentifié."});
		}

		GenericPage.model.remove({key: data.section}).exec((err) => {
			if (err) return res.status(500).send({error: err.message});
			activityLogger.info(`Page générique supprimée par ${user.username}: ${data.section}.`);
			req.flash('success', "Page générique supprimée.");
			return res.status(200).send({});
		});
	},

	["library-add"]: (req, res) => {
		const data = req.body;
		const locals = res.locals;
		const user = locals.user;

		if (!user) {
			return res.status(200).send({error: "Vous n'êtes pas authentifié."});
		}

		const image = req.files.file1;
		const filename = data.filename;

		image.filename = "library-" + filename;
		GridFS.add(image, (err, id) => {
			if (err) return res.status(500).send({error: "Unable to store library image."});
			activityLogger.info(`Librairie: image ajoutée par ${user.username}: ${image.filename}.`);
			req.flash('success', "Image ajoutée.");
			return res.status(200).send({});
		});

	},

	["library-remove"]: (req, res) => {
		const data = req.body;
		const locals = res.locals;
		const user = locals.user;

		if (!user) {
			return res.status(200).send({error: "Vous n'êtes pas authentifié."});
		}

		const filename = data.filename;

		if (!filename) {
			return res.status(500).send({error: "Missing filename."});
		}

		GridFS.remove(filename).then(() => {
			req.flash('success', "Image supprimée.");
			activityLogger.info(`Librairie: image supprimée par ${user.username}: ${filename}.`);
			return res.status(200).send({});
		}).catch(err => {
			return res.status(500).send({error: "Unable to remove library image."});
		});

	},

};


exports = module.exports = (req, res) => {
	const action = req.params['action'];

	if (API[action]) {
		try {
			API[action](req, res);
		} catch (err) {
			console.log(err);
			res.status(500).send({error: "Error in action: " + action});
		}
	} else {
		res.status(500).send({error: "Method not found: No method for action: " + action});
	}
};
