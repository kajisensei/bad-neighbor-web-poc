const keystone = require('keystone');
const Promise = require("bluebird");
const ForumTopic = keystone.list('ForumTopic');
const ForumMessage = keystone.list('ForumMessage');
const User = keystone.list('User');
const Forum = keystone.list('Forum');
const mongoose = require('mongoose');
const moment = require('moment');
const rightsUtils = require("../../rightsUtils");

exports = module.exports = function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;
	const readDate = (locals.user && locals.user.readDate) || null;
	const user = locals.user;

	// Toujours associer une section pour correctement colorer le menu.
	locals.section = 'forums';


	if (req.user && req.query.mark !== undefined) {

		/**
		 * Traiter le "Marquer tous les sujets comme lus"
		 */

		view.on('init', function (next) {
			const User = keystone.list('User');
			User.model.update({
				_id: req.user.id
			}, {
				readDate: new Date()
			}).exec((err) => {
				if (err) return res.err(err, err.name, err.message);
				req.flash('info', 'Les forums ont été marqués comme lus.');
				res.redirect(req.query.mark);
			});

			// Cleanup en background
			ForumTopic.model.update({}, {
				$pull: {views: req.user.id}
			}, {
				multi: true
			}).exec(err => {
			});
		});
	} else {

		/**
		 * Affichage de la page
		 */

		// Get all forum categories
		view.on('init', function (next) {

			// Permission: soit on est pas log et le forum doit etre public, 
			// soit on est log et il doit etre public ou associé à un de nos groupes.
			const queryObj = {};
			if (!user) {
				queryObj["read"] = [];
			} else {
				queryObj["$or"] = [
					{read: []},
					{read: {$in: user.permissions.groups}}
				];
			}

			const query = Forum.model.find(queryObj);
			query.sort({order: 1});

			// TODO: pas opti, on va populer plein de fois le même tag
			query.populate("tags");

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
				
				// Stats
				queries.push(ForumTopic.model.count({}).exec().then(function (count) {
					locals.total_topics = count;
				}));
				queries.push(ForumMessage.model.count({}).exec().then(function (count) {
					locals.total_messages = count;
				}));
				queries.push(User.model.count({}).exec().then(function (count) {
					locals.total_members = count;
				}));
				queries.push(User.model.findOne({}).sort({
					createdAt: -1
				}).exec().then(function (user) {
					locals.most_recent_user = user;
				}));
				
				const fiveMinutes = moment();
				fiveMinutes.subtract(5, 'minutes');
				console.log(fiveMinutes.toDate());
				queries.push(User.model.find({
					connectDate: {$gte: fiveMinutes.toDate()}
				}).sort({
					connectDate: -1
				}).exec().then(function (users) {
					locals.last_users = users;
				}));
				
				for (const forum of locals.forums) {

					// Vérifier qu'il n'y a pas un tags exclu pour ce forum
					const excludedTags = rightsUtils.getExcludedTags(user, forum.tags);

					// On compte le nombre de sujets
					queries.push(ForumTopic.model.count({
						forum: forum.id,
						tags: {$nin: excludedTags}
					}).exec().then(function (count) {
						forum.topics = count;
					}));

					// On regarde si il y a au moins un sujet non-lu
					const query = {
						forum: forum.id,
						tags: {$nin: excludedTags}
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
						forum: forum.id,
						tags: {$nin: excludedTags}
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
