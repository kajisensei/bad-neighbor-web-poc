const keystone = require('keystone');
const GridFS = require("../../../../gridfs/GridFS.js");
const User = keystone.list('User');
const Forum = keystone.list('Forum');
const ForumTopic = keystone.list('ForumTopic');
const ForumMessage = keystone.list('ForumMessage');
const rightsUtils = require("../../../rightsUtils.js");
const discord = require("./../../../../apps/DiscordBot.js");

const API = {

	/*
	 * Create topic
	 */
	["create"]: (req, reqObject, res) => {
		const data = req.body;
		const locals = res.locals;
		const user = locals.user;

		if (!user)
			return res.status(500).send({error: "Vous n'êtes pas authentifié."});
		if (!data || !data.forum)
			return res.status(500).send({error: "Missing data or data arguments:"});

		Forum.model.findOne({
			_id: data.forum
		}).exec((err, forum) => {
			if (err) return res.status(500).send({error: "Can't find forum: " + data.forum});

			const canRead = rightsUtils.canXXX("read", forum, user);
			if (!canRead) {
				req.flash('error', "Vous n'avez pas le droit de consulter ce forum.");
				return res.status(200).send({url: '/forums/'});
			}

			const canWrite = rightsUtils.canXXX("write", forum, user);
			if (!canWrite) {
				req.flash('error', "Vous n'avez pas le droit de créer un sujet dans ce forum.");
				return res.status(200).send({url: '/forum/' + forum.key});
			}

			// TODO: vérifier que le nom de sujet est dispo

			// Créer le sujet
			const model = {
				name: data.title,
				forum: data.forum,
				views: [req.user.id]
			};
			if (data.tags) {
				model.tags = data.tags;
			}
			const newTopic = new ForumTopic.model(model);
			newTopic._req_user = req.user;

			newTopic.save((err, topic) => {
				if (err) return res.status(500).send({error: "Error during topic creation:" + err});

				// Créer le premier message
				const newMessage = new ForumMessage.model({
					content: data.content,
					author: req.user.username,
					topic: topic.id,
					author_ip: req.connection.remoteAddress
				});
				newMessage._req_user = req.user;
				newMessage.save((err, message) => {
					if (err) return res.status(500).send({error: "Error during first message creation:" + err});

					// Ajouter le premier message en lien direct au topic 
					ForumTopic.model.update({
						_id: topic.id
					}, {
						first: message.id,
						last: message.id
					}).exec(err => {
						if (err) return res.status(500).send({error: "Error during message linking:" + err});

						// Incremente le compteur de post
						User.model.update({_id: req.user.id}, {$inc: {'posts': 1}}, err => {

							// Async discord notif
							discord.sendMessage(`Nouveau sujet par ${req.user.username}: ${topic.name}`, {
								embed: {
									title: `${topic.name}`,
									description: `Nouveau sujet dans le forum ${forum.name}`,
									url: process.env.BASE_URL + '/forum-topic/' + topic.key,
									author: {
										name: req.user.username,
										url: process.env.BASE_URL + '/member/' + req.user.key,
										icon_url: process.env.BASE_URL + `/images/avatar-${req.user.key}?default=avatar`
									}
								}
							});

							req.flash('success', 'Sujet créé: ' + data.title);
							return res.status(200).send({url: '/forum-topic/' + topic.key});
						});
					});

				});
			});
		});

	},

	/*
	 * Remove topic
	 */
	["remove"]: (req, reqObject, res) => {
		const data = req.body;
		const locals = res.locals;
		const user = locals.user;

		if (!user)
			return res.status(500).send({error: "Vous n'êtes pas authentifié."});

		// TODO: droit de modération

		// Remove messages and topic
		const queries = [];

		queries.push(ForumTopic.model.remove({_id: data.id}).exec());
		queries.push(ForumMessage.model.remove({topic: data.id}).exec());
		queries.push(GridFS.remove("article-" + data.topicKey));

		Promise.all(queries).then(() => {
			req.flash('success', 'Sujet supprimé');
			res.status(200).send({});
		}).catch(err => {
			res.status(500).send({error: "Error during deletion:" + err});
		});
	},

	/*
	 * Edit topic
	 */
	["update"]: (req, reqObject, res) => {
		const data = req.body;
		const locals = res.locals;
		const user = locals.user;

		if (!user)
			return res.status(500).send({error: "Vous n'êtes pas authentifié."});

		// TODO: droit de modération

		// Edit topic
		ForumTopic.model.update({_id: data.id}, {
			name: data.title,
			tags: data.tags
		}, err => {
			if (err)
				res.status(500).send({error: "Error during deletion:" + err});

			req.flash('success', 'Sujet modifié');
			res.status(200).send({});
		});
	},

	/*
	 * Switch épingle
	 */
	["pinned"]: (req, reqObject, res) => {
		const data = req.body;
		const locals = res.locals;
		const user = locals.user;

		if (!user)
			return res.status(500).send({error: "Vous n'êtes pas authentifié."});

		// TODO: droit de modération

		ForumTopic.model.findOne({key: data.topicKey}).select("flags key").exec((err, topic) => {
			if (err) return res.status(500).send({error: "Error during topic pin switch:" + err});

			if (!topic)
				return res.status(500).send({error: "Can't find topic with key: " + data.topicKey});

			ForumTopic.model.update({key: data.topicKey}, {
				["flags.pinned"]: !topic.flags.pinned
			}, (err) => {
				if (err) return res.status(500).send({error: "Error during topic pin switch:" + err});

				req.flash('success', !topic.flags.pinned ? "Sujet épinglé" : "Épingle retirée");
				res.status(200).send({}).end();
			});
		});
	},

	/*
	 * Switch annonce
	 */
	["announce"]: (req, reqObject, res) => {
		const data = req.body;
		const locals = res.locals;
		const user = locals.user;

		if (!user)
			return res.status(500).send({error: "Vous n'êtes pas authentifié."});

		// TODO: droit de modération

		ForumTopic.model.findOne({key: data.topicKey}).select("flags key").exec((err, topic) => {
			if (err) return res.status(500).send({error: "Error during topic announce switch:" + err});

			if (!topic)
				return res.status(500).send({error: "Can't find topic with key: " + data.topicKey});

			ForumTopic.model.update({key: data.topicKey}, {
				["flags.announcement"]: !topic.flags.announcement
			}, (err) => {
				if (err) return res.status(500).send({error: "Error during topic announce switch:" + err});

				req.flash('success', !topic.flags.announcement ? "Sujet placé en annonce" : "Retrait du sujet en annonce");
				res.status(200).send({}).end();
			});
		});
	},

	/*
	 * Switch verrou
	 */
	["lock"]: (req, reqObject, res) => {
		const data = req.body;
		const locals = res.locals;
		const user = locals.user;

		if (!user)
			return res.status(500).send({error: "Vous n'êtes pas authentifié."});

		// TODO: droit de modération

		ForumTopic.model.findOne({key: data.topicKey}).select("flags key").exec((err, topic) => {
			if (err) return res.status(500).send({error: "Error during topic lock switch:" + err});

			if (!topic)
				return res.status(500).send({error: "Can't find topic with key: " + data.topicKey});

			ForumTopic.model.update({key: data.topicKey}, {
				["flags.closed"]: !topic.flags.closed
			}, (err) => {
				if (err) return res.status(500).send({error: "Error during topic lock switch:" + err});

				req.flash('success', !topic.flags.closed ? "Sujet verrouillé" : "Sujet déverouillé");
				res.status(200).send({}).end();
			});
		});
	},


	/*
	 * Selection de sujet
	 */
	["selection"]: (req, reqObject, res) => {
		const data = req.body;
		const locals = res.locals;
		const user = locals.user;

		if (!user)
			return res.status(500).send({error: "Vous n'êtes pas authentifié."});

		// TODO: droit de modération


		if (!data || !data.topicKey) {
			return res.status(500).send({error: "Missing data or topicKey in data."});
		}

		// Get message in DB
		ForumTopic.model.update({
			key: data.topicKey
		}, {
			["selection.date"]: new Date(),
			["selection.category"]: data.category
		}, (err, result) => {
			if (err)
				return res.status(500).send({error: "Error fetching data."});
			if (!result || result.n === 0)
				return res.status(200).send({error: "Unknown topic Key: " + data.topicKey});

			req.flash('success', "Article ajouté à la sélection 'En direct du forum' !");
			return res.status(200).send({});
		});
	},

	/*
	 * Publication de sujet
	 */
	["publish"]: (req, reqObject, res) => {
		const data = req.body;
		const locals = res.locals;
		const image = req.files.file1;
		const user = locals.user;

		if (!user)
			return res.status(500).send({error: "Vous n'êtes pas authentifié."});

		// TODO: droit de modération

		if (!data || !data.topicKey) {
			return res.status(500).send({error: "Missing data or topicKey in data."});
		}

		// Get message in DB
		ForumTopic.model.update({
			key: data.topicKey
		}, {
			["publish.date"]: new Date(),
			["publish.title"]: data.title,
			["publish.type"]: data.type,
			["publish.category"]: data.category,
		}, (err, result) => {
			if (err)
				return res.status(500).send({error: "Error fetching data."});
			if (!result || result.n === 0)
				return res.status(200).send({error: "Unknown topic Key: " + data.topicKey});

			// On redimensionne et sauvegarde l'image
			// Resize, max x width/height
			const sharp = require('sharp');
			const fileName = image.path + "-resized.png";
			sharp(image.path)
				.resize(locals.prefs.forum.publish_image_size)
				.toFile(fileName, (err, info) => {
					if (err) return res.status(500).send({error: "Unable to resize article image."});

					image.filename = "article-" + data.topicKey;
					image.path = fileName;
					GridFS.add(image, (err, id) => {
						if (err) return res.status(500).send({error: "Unable to store article image."});

						req.flash('success', "Article publié.");
						return res.status(200).send({});
					});
				});

		});

	},


	/*
	 * Dépublication de sujet
	 */
	["unpublish"]: (req, reqObject, res) => {
		const data = req.body;
		const locals = res.locals;

		const user = locals.user;

		if (!user)
			return res.status(500).send({error: "Vous n'êtes pas authentifié."});

		// TODO: droit de modération

		if (!data || !data.topicKey) {
			return res.status(500).send({error: "Missing data or topicKey in data."});
		}

		// Get topic in DB
		ForumTopic.model.update({
			key: data.topicKey
		}, {
			$unset: {publish: "", selection: ""}
		}, (err, result) => {
			if (err)
				return res.status(500).send({error: "Error fetching data:" + err});
			if (!result || result.n === 0)
				return res.status(200).send({error: "Unknown topic Key: " + data.topicKey});

			// Remove article image
			const filename = "article-" + data.topicKey;
			GridFS.remove(filename).then(() => {
				req.flash('success', "Article dépublié.");
				res.status(200).send({});
			}).catch(err => {
				res.status(500).send({error: "Error removing article picture:" + err});
			});

		});
	},

	/*
	 * Recrutement
	 */
	["recrutement"]: (req, reqObject, res) => {
		const data = req.body;
		const locals = res.locals;
		const user = req.user;

		if (!user) {
			return res.status(200).send({error: "Vous n'êtes pas authentifié."});
		}

		// formater le message
		let messageContent = "## Candidature " + user.username + "\n\n";
		messageContent += "### Le criminel\n";
		messageContent += "> **[Fiche du personnage](/member/" + user.key + ")**\n\n";
		messageContent += "### Le joueur\n";
		messageContent += "**Prénom:**  \n" + (data.first || "/") + "\n\n";
		messageContent += "**Age:**  \n" + (data.age || "/") + "\n\n";
		messageContent += "**Matos:**  \n" + (data.matos || "/") + "\n\n";
		messageContent += "**Jeu principal:**  \n" + (data.pledge || "/") + "\n\n";
		if (user.starCitizen && user.starCitizen.handle) {
			messageContent += `**Handle RSI:**  \n[https://robertsspaceindustries.com/citizens/${user.starCitizen.handle}](https://robertsspaceindustries.com/citizens/${user.starCitizen.handle})\n\n`;
		}
		messageContent += "**Frequence de jeu:**  \n" + (data.frequence || "/") + "\n\n";
		messageContent += "**Expérience MMO / Jeux et Space Sim:**  \n" + (data.experience || "/") + "\n\n";
		messageContent += "**Comment nous as-tu connu ?**  \n" + (data.where || "/") + "\n\n";
		messageContent += "**Info particulière:**  \n" + (data.info || "/") + "\n\n";
		messageContent += "**Candidature:**  \n" + (data.candidature || "/") + "\n\n";

		// Trouver le forum de recrutement
		Forum.model.findOne({key: "recrutement"}).exec((err, forum) => {
			if (err || !forum)
				return res.status(500).send({error: "Pas de forum 'recrutement' détecté."});

			// Créer le topic
			const model = {
				name: "Candidature " + user.username,
				forum: forum.id,
				views: [req.user.id],
			};
			const newTopic = new ForumTopic.model(model);
			newTopic._req_user = req.user;
			newTopic.save((err, topic) => {
				if (err) {
					return res.status(500).send({error: "Error creating recruitement topic."});
				}

				// Créer le premier message
				const newMessage = new ForumMessage.model({
					content: messageContent,
					author: req.user.username,
					topic: topic.id
				});
				newMessage._req_user = req.user;

				newMessage.save((err, message) => {
					if (err) {
						return res.status(500).send({error: "Error creating recruitement message."});
					}

					// Ajouter le premier message en lien direct au topic 
					ForumTopic.model.update({
						_id: topic.id
					}, {
						first: message.id,
						last: message.id
					}).exec(err => {
						if (err) {
							return res.status(500).send({error: "Error linking message to topic."});
						}

						// Async discord notif
						discord.sendMessage(`Nouvelle candidature: ${topic.name}`, {
							embed: {
								title: `${topic.name}`,
								description: `Nouvelle candidature, lâchez les chiens !`,
								url: process.env.BASE_URL + '/forum-topic/' + topic.key,
								author: {
									name: req.user.username,
									url: process.env.BASE_URL + '/member/' + req.user.key,
									icon_url: process.env.BASE_URL + `/images/avatar-${req.user.key}?default=avatar`
								}
							}
						});

						return res.status(200).send({topicKey: topic.key});
					});

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
