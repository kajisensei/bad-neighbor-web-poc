/**
 * Created by Cossement Sylvain on 23-04-17.
 */
const keystone = require('keystone');
const Promise = require("bluebird");
const ForumTopic = keystone.list('ForumTopic');
const ForumMessage = keystone.list('ForumMessage');
const rightsUtils = require("../../rightsUtils.js");
const textUtils = require("../../textUtils.js");
const discord = require("./../../../apps/DiscordBot.js");

exports = module.exports = (req, res) => {

	const view = new keystone.View(req, res);
	const locals = res.locals;
	const user = locals.user;

	// Toujours associer une section pour correctement colorer le menu.
	locals.section = 'forums';
	locals.topicKey = req.params['topic'];
	locals.url = "/forum-topic/" + locals.topicKey + "/";
	const messageId = req.query['message'];
	let pageNum = req.params.page;

	// On chope le topic
	view.on("init", next => {
		const query = ForumTopic.model.findOne({
			"key": locals.topicKey
		}).populate("tags"); //TODO: optimize: on a tous les tags avec le query sur le parent en dessous
		query.exec((err, topic) => {
			if (err) {
				res.err(err, err.name, err.message);
				return;
			}
			if (!topic) {
				res.notfound();
				return;
			}
			locals.topic = topic;
			locals.topic_json = JSON.stringify(topic);
			next();
		});
	});

	// Vérifier le forum parent et ses droits
	view.on('init', (next) => {
		const query = keystone.list('Forum').model.findOne({'_id': locals.topic.forum}).populate("tags");
		query.exec((err, forum) => {
			if (err) {
				res.err(err, err.name, err.message);
				return;
			}

			if (!forum) {
				res.notfound();
				return;
			}

			// Vérifier qu'on y ai accès. Si non => redirect
			if (!rightsUtils.canXXX("read", forum, user)) {
				req.flash('error', "Vous n'avez pas accès à ce forum.");
				return res.redirect("/forums");
			}

			// Vérifier qu'il n'y a pas un tags exclu
			const excludedTags = rightsUtils.getExcludedTags(user, forum.tags);
			locals.excludedTags = excludedTags;
			let fail = false;
			if (locals.topic.tags && locals.topic.tags.length) {
				locals.topic.tags.forEach(t => {
					if (excludedTags.includes(String(t._id))) {
						fail = true;
					}
				});
			}
			if (fail) {
				req.flash('error', "Vous n'avez pas accès à ce sujet.");
				return res.redirect("/forum/" + forum.key);
			}

			// Tag editable
			locals.editableTags = rightsUtils.getEditableTags(user, forum.tags);

			// Droit de réponse
			locals.canReply = rightsUtils.canXXX("write-post", forum, user);

			// Droit de modération
			locals.canModerate = rightsUtils.allowXXX("moderation", forum, user);

			// On ajoute l'entrée navigation
			locals.breadcrumbs = [{
				url: "/forum/" + forum.key,
				text: forum.name,
			}, {
				url: "/forum-topic/" + locals.topic.key,
				text: locals.topic.name,
			}];

			locals.forum = forum;

			next();
		});
	});

	// Ajoute le flag "read" à cet utilisateur pour ce topic et inc les view
	view.on('init', (next) => {
		const query = {};
		if (!req.params.page) {
			query["$inc"] = {'stats.views': 1};
		}
		if (req.user && req.user.readDate && req.user.readDate < locals.topic.updatedAt) {
			query["$addToSet"] = {'views': req.user.id}
		}
		ForumTopic.model.update({
			_id: locals.topic.id
		}, query).exec(err => {
			if (err) return res.err(err, err.name, err.message);

			next();
		});
	});

	// Si on a l'argument message, on doit calculer sur quelle page on est
	view.on('init', (next) => {
		if (messageId) {
			ForumMessage.model.find({
				"topic": locals.topic.id,
			})
				.select("_id")
				.exec((err, messages) => {
					if (err) return res.err(err, err.name, err.message);

					let index = 0;
					for (let message of messages) {
						if (String(message._id) === messageId) {
							// On calcule sur quelle page cela se trouve
							pageNum = Math.ceil((index + 1) / locals.prefs.forum.message_per_page);
						}
						index++;
					}

					next();
				});
		} else {
			next();
		}
	});

	// On chope les messages
	view.on("init", next => {

		// Compter le nombre total de sujet
		const searchQuery = {
			"topic": locals.topic.id,
		};
		ForumMessage.model.count(searchQuery).exec((err, count) => {
			if (err) return res.err(err, err.name, err.message);

			locals.totalTopics = count;
			locals.totalPages = Math.ceil(count / locals.prefs.forum.message_per_page);
			locals.currentPage = pageNum === "last" ? locals.totalPages : Number(pageNum || 1);

			// Choper les messages de la page
			//TODO: c'est pas méga opti les populates, à améliorer !!!
			ForumMessage.model.find(searchQuery)
				.populate("updatedBy", "username key")
				.populate({
					path: 'createdBy',
					select: 'username avatar key sign posts medals permissions.groups personnal.discord',
					populate: {path: 'medals permissions.groups'}
				})
				.sort({"createdAt": 1})
				.skip(locals.currentPage > 0 ? (locals.currentPage - 1) * locals.prefs.forum.message_per_page : 0)
				.limit(locals.prefs.forum.message_per_page)
				.exec((err, messages) => {
					if (err) return res.err(err, err.name, err.message);

					if (!messages.length) {
						throw new Error("Error in data coherence: No message found for topic: " + locals.topic.key);
					}

					// Render markdown
					for (const message of messages) {
						message.canEdit = locals.canModerate || (user && String(user._id) === String(message.createdBy._id));
						message.original = message.content;
						message.content = textUtils.markdownize(message.content);

						if (message.createdBy) {
							if (message.createdBy.personnal.discord) {
								message.createdBy.presence = discord.getUserPresence(message.createdBy.personnal.discord);
							}
							if (message.createdBy.sign) {
								message.createdBy.sign = textUtils.markdownize(message.createdBy.sign);
							}
							message.createdBy.permissions.groups.sort((a, b) => a.order - b.order);
						}
					}

					locals.topic_messages = messages;

					next();
				});
		});
	});

	// Render the view
	view.render('forum/forum_topic');

};
