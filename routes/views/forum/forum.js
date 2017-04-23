/*
 Gestion de la logique de l'affichage d'un forum
 */

const keystone = require('keystone');
const Promise = require("bluebird");
const ForumTopic = keystone.list('ForumTopic');
const ForumMessage = keystone.list('ForumMessage');

exports = module.exports = (req, res) => {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	// Toujours associer une section pour correctement colorer le menu.
	locals.section = 'forums';
	locals.forumKey = req.params['forum'];

	// 1) Vérification que le forum existe
	view.on('init', (next) => {
		// TODO: Vérifier qu'on y ai accès. Si non => 403
		const query = keystone.list('Forum').model.findOne({'key': locals.forumKey});
		query.exec((err, forum) => {
			if (err) {
				res.err(err, err.name, err.message);
				return;
			}

			if (!forum) {
				res.notfound();
				return;
			}
			locals.forum = forum;
			next();
		});
	});

	// 2) Il faut aller chercher en DB: les annonces et les 20 derniers épinglés
	// On peut parrelleliser ces deux recherches
	view.on('init', (next) => {

		const queries = [];

		// Les annonces
		queries.push(ForumTopic.model.find({
				"flags.announcement": true
			})
				.sort({
					"createdAt": -1
				})
				.populate('createdBy', 'username')
				.exec()
				.then((announcements) => {
					locals.announcements = announcements;
				})
		);

		// Les 20 derniers sujets du forum
		queries.push(ForumTopic.model.find({
				"forum": locals.forum.id,
				"flags.announcement": false
			})
				.sort({
					// TODO: il faut trier selon flags.pinned aussi, pour que les épingles passent en premier
					"createdAt": -1
				})
				.populate('createdBy', 'username')
				.limit(locals.prefs.forum.topic_per_page)
				.exec()
				.then((topics) => {
					console.log(topics);
					console.log(typeof topics);
					locals.topics = topics;
				})
		);

		Promise.all(queries).then(() => {
			next();
		});

	});

	// On chope le dernier message de chaque topic
	view.on('init', (next) => {
		if (!locals.topics) {
			// On a pas de liste de topic: il y a eu un soucis à l'étape précédente
			res.err("", "Error during forum listing", "No topic list found for forum: " + locals.forum.id);
			return;
		}

		// On va faire les queries en parrallèle
		const queries = [];
		locals.topic_last_message = {};
		for (let topic of locals.topics) {
			queries.push(ForumMessage.model.findOne({
					"topic": topic.id,
				})
					.sort({
						"createdAt": -1
					})
					.select("createdAt content author createdBy")
					.populate('createdBy', 'username')
					.exec()
					.then(message => {
						locals.topic_last_message[topic.id] = message;
					})
			);
		}
		Promise.all(queries).then(function () {
			next();
		});

	});

	// Render the view
	view.render('forum/forum');
};
