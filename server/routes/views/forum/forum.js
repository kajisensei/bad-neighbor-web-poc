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
	const readDate = (locals.user && locals.user.readDate) || null;
	const page = locals.currentPage = Number(req.params.page || 1);
	const currentTag = locals.currentTag = req.query.tag;

	// Toujours associer une section pour correctement colorer le menu.
	locals.section = 'forums';
	locals.forumKey = req.params['forum'];
	locals.url = "/forum/" + locals.forumKey + "/";

	// 1) Vérification que le forum existe
	view.on('init', (next) => {
		// TODO: Vérifier qu'on y ai accès. Si non => 403
		const query = keystone.list('Forum').model
			.findOne({'key': locals.forumKey})
			.populate("tags");
		query.exec((err, forum) => {
			if (err) return res.err(err, err.name, err.message);

			locals.forum = forum;

			if (forum) {
				// On ajoute l'entrée navigation
				locals.breadcrumbs = [{
					url: "/forum/" + forum.key,
					text: forum.name,
				}];
				
				// Tag map
				locals.tagMap = {};
				for(const tag of forum.tags) {
					locals.tagMap[tag.id] = tag;
				}
			}

			next();
		});
	});

	// 2) Il faut aller chercher en DB: les annonces et les 20 derniers épinglés
	// On peut parrelleliser ces deux recherches
	view.on('init', (next) => {

		if (!locals.forum)
			return next();

		const queries = [];

		// Les annonces
		queries.push(ForumTopic.model.find({
				"flags.announcement": true
			})
				.sort({'updatedAt': -1})
				.populate('createdBy', 'username key')
				.exec()
				.then((announcements) => {
					locals.announcements = announcements;
				})
		);

		// Compter le nombre total de sujet
		const searchQuery = {
			"forum": locals.forum.id,
			"flags.announcement": false
		};
		if (currentTag) {
			searchQuery.tag = currentTag;
		}
		queries.push(ForumTopic.model.count(searchQuery).exec().then(count => {
			locals.totalTopics = count;
			locals.totalPages = Math.ceil(count / locals.prefs.forum.topic_per_page);
		}));

		// Les sujets de la page en cours
		queries.push(ForumTopic.model.find(searchQuery)
			.sort([['flags.pinned', -1], ['updatedAt', -1]])
			.populate('createdBy', 'username key')
			.populate({
				path: 'last',
				populate: {path: 'createdBy'}
			})
			.skip(page > 0 ? (page - 1) * locals.prefs.forum.topic_per_page : 0)
			.limit(locals.prefs.forum.topic_per_page)
			.exec()
			.then((topics) => {
				if (req.user) {
					for (topic of topics) {
						topic.unread = (readDate === null || readDate < topic.updatedAt) && topic.views.indexOf(req.user.id) === -1;
					}
				}
				locals.topics = topics;
			})
		);

		Promise.all(queries).then(() => {
			next();
		}).catch(err => {
			console.log(err);
			res.err(err, err.name, err.message);
		});

	});

	// Render the view
	view.render('forum/forum');
};
