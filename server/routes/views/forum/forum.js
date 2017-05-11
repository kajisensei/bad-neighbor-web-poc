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
			
			// On ajoute l'entrée navigation
			locals.breadcrumbs = [{
				url: "/forum/" + forum.key,
				text: forum.name,
			}];
			
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
				.populate({
					path: 'last',
					populate: { path: 'createdBy' }
				})
				.limit(locals.prefs.forum.topic_per_page)
				.exec()
				.then((topics) => {
					locals.topics = topics;
				})
		);

		Promise.all(queries).then(() => {
			next();
		});

	});

	// Render the view
	view.render('forum/forum');
};
