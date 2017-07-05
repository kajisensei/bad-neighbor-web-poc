/**
 * Created by Cossement Sylvain on 23-04-17.
 */
const keystone = require('keystone');
const Promise = require("bluebird");
const ForumTopic = keystone.list('ForumTopic');
const ForumMessage = keystone.list('ForumMessage');

exports = module.exports = (req, res) => {

	const view = new keystone.View(req, res);
	const locals = res.locals;
	const page = locals.currentPage = Number(req.params.page || 1);

	// Toujours associer une section pour correctement colorer le menu.
	locals.section = 'forums';
	locals.topicKey = req.params['topic'];
	locals.url = "/forum-topic/" + locals.topicKey + "/";

	// On chope le topic, tout en incrémentant le nombre de vues
	view.on("init", next => {
		const query = ForumTopic.model.findOne({
			"key": locals.topicKey
		});
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
			next();
		});
	});

	// Vérifier le forum parent et ses droits
	// TODO: on vérifie que le gars y ai accès
	view.on('init', (next) => {
		const query = keystone.list('Forum').model.findOne({'_id': locals.topic.forum});
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
		const query = {
			$inc: {'stats.views': 1}, //TODO: pas updater si pagination
		};
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


	// On chope les messages
	view.on("init", next => {

		const queries = [];

		// Compter le nombre total de sujet
		const searchQuery = {
			"topic": locals.topic.id,
		};
		queries.push(ForumMessage.model.count(searchQuery).exec().then(count => {
			locals.totalTopics = count;
			locals.totalPages = Math.ceil(count / locals.prefs.forum.message_per_page);
		}));

		// Choper les messages de la page
		queries.push(ForumMessage.model.find(searchQuery)
			.populate("createdBy updatedBy", "username avatar key sign posts")
			.sort({"createdAt": 1})
			.skip(page > 0 ? (page - 1) * locals.prefs.forum.message_per_page : 0)
			.limit(locals.prefs.forum.message_per_page)
			.exec().then((messages) => {
				if (!messages.length) {
					res.err("", "Error in data coherence", "No message found for topic: " + locals.topic.key);
					return;
				}

				// Render markdown
				const showdown = require('showdown'),
					xss = require('xss'),
					converter = new showdown.Converter();
				for (const message of messages) {
					message.original = message.content;
					message.content = xss(converter.makeHtml(message.content));
					if (message.createdBy && message.createdBy.sign) {
						message.createdBy.sign = xss(converter.makeHtml(message.createdBy.sign));
					}
				}

				locals.topic_messages = messages;
			}));

		Promise.all(queries).then(() => {
			next();
		}).catch(err => {
			console.log(err);
			res.err(err, err.name, err.message);
		});
	});
	
	// Render the view
	view.render('forum/forum_topic');

};
