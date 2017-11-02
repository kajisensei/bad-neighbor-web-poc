const keystone = require('keystone');
const GridFS = require("../../../../gridfs/GridFS.js");
const GenericPage = keystone.list('GenericPage');
const bcrypt = require('bcrypt');
const mail = require("../../../../mailin/mailin.js");

const API = {

	/*
	 * Star Citizen
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
			req.flash('success', "Page générique supprimée.");
			return res.status(200).send({});
		});
	}

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
