const keystone = require('keystone');
const GridFS = require("../../../../gridfs/GridFS.js");
const User = keystone.list('User');
const bcrypt = require('bcrypt');

const API = {

	/*
	 * Star Citizen
	 */

	sc: (req, reqObject, res) => {
		const data = req.body;
		const locals = res.locals;
		const user = locals.user;

		if (!user) {
			return res.status(200).send({error: "Vous n'êtes pas authentifié."});
		}

		User.model.update({_id: user.id}, {
			['starCitizen.isSC']: data.isSC,
			['starCitizen.character.first']: data.first,
			['starCitizen.character.last']: data.last,
			['starCitizen.description']: data.description,
			['starCitizen.jobs']: data.jobs,
			['starCitizen.ships']: data.ships,
		}, (err, ok) => {
			if (err) return res.status(500).send({error: err.message});

			req.flash('success', "Paramètres de Star Citizen sauvegardés.");
			return res.status(200).send({});

		});
	},

	/*
	 * Password
	 */

	password: (req, reqObject, res) => {
		const data = req.body;
		const locals = res.locals;
		const user = locals.user;

		if (!user) {
			return res.status(200).send({error: "Vous n'êtes pas authentifié."});
		}

		bcrypt.hash(data.password, 10, function (err, hash) {
			if (err) return res.status(500).send({error: err.message});

			User.model.update({_id: user.id}, {
				password: hash
			}, (err, ok) => {
				if (err) return res.status(500).send({error: err.message});
				req.flash('success', "Mot de passe modifié.");
				return res.status(200).send({});
			});
		});

	},

	/*
	 * Parameters
	 */

	parameters: (req, reqObject, res) => {
		const data = req.body;
		const locals = res.locals;
		const user = locals.user;

		if (!user) {
			return res.status(200).send({error: "Vous n'êtes pas authentifié."});
		}

		// Vérifier que le email est dispo
		User.model.findOne({_id: {$ne: user.id}, email: data.email}).exec((err, found) => {
			if (err) return res.status(500).send({error: err.message});
			if (found) {
				return res.status(200).send({error: "Cette adresse email n'est pas disponible."});
			}

			// Vérifier que le username est dispo
			User.model.findOne({
				_id: {$ne: user.id},
				username: {'$regex': data.username, $options: 'i'}
			}).exec((err, found) => {
				if (err) return res.status(500).send({error: err.message});
				if (found) {
					return res.status(200).send({error: "Ce nom d'utilisateur n'est pas disponible."});
				}

				let store = {
					email: data.email,
					username: data.username,
					sign: data.sign,
					['personnal.city']: data.city,
				};
				if (data.birthday) {
					console.log(data.birthday);
					store['personnal.birthday'] = new Date(data.birthday);
				} else {
					store.$unset = {
						'personnal.birthday': ""
					};
				}

				// Change data
				User.model.update({_id: user.id}, store, (err, ok) => {
					if (err) return res.status(500).send({error: err.message});

					// Upload avatar
					const image = req.files.file1;

					if (image) {

						// Resize, max x width/height
						const sharp = require('sharp');
						const fileName = image.path + "-resized.png";
						sharp(image.path)
							.resize(locals.prefs.member.avatar_max_size)
							.toFile(fileName, (err, info) => {
								if (err) return res.status(500).send({error: "Unable to resize avatar image."});

								image.filename = "avatar-" + user.key;
								image.path = fileName;
								GridFS.add(image, (err, id) => {
									if (err) return res.status(500).send({error: "Unable to store avatar image."});

									req.flash('success', "Paramètres du compte et avatar sauvegardés.");
									return res.status(200).send({});
								});
							});

					} else {
						req.flash('success', "Paramètres du compte sauvegardés.");
						return res.status(200).send({});
					}

				});

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
