const keystone = require('keystone');
const Promise = require("bluebird");
const ForumTopic = keystone.list('ForumTopic');
const Forum = keystone.list('Forum');

exports = module.exports = function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;
	const readDate = (locals.user && locals.user.readDate) || null;

	// Toujours associer une section pour correctement colorer le menu.
	locals.section = 'forums';

	
	if(req.user && req.query.mark !== undefined) {

		/**
		 * Traiter le "Marquer tous les sujets comme lus"
		 */
		
		view.on('init', function (next) {
			const User = keystone.list('User');
			User.model.update({
				_id: req.user.id
			},{
				readDate: new Date()
			}).exec((err) => {
				if (err) return res.err(err, err.name, err.message);
				req.flash('info', 'Les forums ont été marqués comme lus.');
				res.redirect(req.query.mark);
			});
		});
	} else {

		/**
		 * Affichage de la page
		 */
		
		// Get all forum categories
		view.on('init', function (next) {

			// TODO: Restreindre aux forums auxquels on a accès
			const query = Forum.model.find({});
			query.sort({order: 1});

			query.exec(function (err, forums) {
				if (err) return res.err(err, err.name, err.message);

				const groups = {};
				const groupOrder = [];
				for (const forum of forums) {
					if (!groups[forum.group]) {
						groups[forum.group] = [];
						groupOrder.push(forum.group);
					}
					groups[forum.group].push(forum);
				}

				locals.forums = forums;
				locals.groups = groups;
				locals.groupOrder = groupOrder;

				next();
			});

		});

		// Count #topics for each forum
		view.on('init', function (next) {

			if (locals.forums) {

				const queries = [];
				for (const forum of locals.forums) {

					// On compte le nombre de sujets
					queries.push(ForumTopic.model.count({
						forum: forum.id
					}).exec().then(function (count) {
						forum.topics = count;
					}));

					// On regarde si il y a au moins un sujet non-lu
					const query = {
						forum: forum.id
					};
					if (req.user) {
						query.views = {$ne: req.user.id};
					}
					if (readDate) {
						query.updatedAt = {$gt: readDate};
					}
					queries.push(ForumTopic.model.findOne(query).exec().then(function (topic) {
						forum.unread = topic;
					}));

					// On chope le dernier sujet, avec son dernier message
					queries.push(ForumTopic.model.findOne({
						forum: forum.id
					}).select("last key").sort({updatedAt: -1})
						.populate("last")
						.populate({
							path: 'last',
							populate: {path: 'createdBy'}
						})
						.exec().then(function (lasttopic) {
							forum.lasttopic = lasttopic;
						}));

				}

				Promise.all(queries).then(function () {
					next();
				}).catch(err => {
					res.err(err, err.name, err.message);
				});
			}

		});
		
	}

	// Render the view
	view.render('forum/forums');
};
