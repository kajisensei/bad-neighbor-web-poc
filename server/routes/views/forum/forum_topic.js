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

	// Toujours associer une section pour correctement colorer le menu.
	locals.section = 'forums';
	locals.topicKey = req.params['topic'];

	// On chope le topic, tout en incrémentant le nombre de vues
	view.on("init", next => {
		const query = ForumTopic.model.findOneAndUpdate({
			"key": locals.topicKey
		}, {
			$inc: {'stats.views': 1} //TODO: pas updater si pagination
		}, {
			new: true
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

	// TODO: on vérifie que le gars y ai accès

	// On chope les messages
	// TODO: Paginer
	view.on("init", next => {
		const query = ForumMessage.model.find().where("topic").equals(locals.topic.id).populate("createdBy updatedBy", "username avatar key").sort({"createdAt": 1});

		query.exec((err, messages) => {
			if (err) {
				res.err(err, err.name, err.message);
				return;
			}
			if (!messages.length) {
				res.err("", "Error in data coherence", "No message found for topic: " + locals.topic.key);
				return;
			}

			// Render markdown
			const showdown = require('showdown'),
				xss = require('xss'),
				converter = new showdown.Converter();
			for(const message of messages) {
				message.content = xss(converter.makeHtml(message.content));
			}
			
			locals.topic_messages = messages;
			next();
		});
	});

	// Action: new message
	locals.formData = req.body || {};
	locals.validationErrors = {};

	const validation = () => {
		if (!locals.formData.message) {
			locals.validationErrors.message = true;
			req.flash('error', "Le corps du message ne peut pas être vide.");
		}
		// TODO: Vérification sur la longueur du post ?
	};

	if (req.user) {
		view.on('post', {action: 'post-message', post: ''}, next => {
			validation();
			// Si pas d'erreur de validation
			if (!Object.keys(locals.validationErrors).length) {
				const newMessage = new ForumMessage.model({
					content: locals.formData.message,
					author: req.user.username,
					topic: locals.topic.id
				});
				newMessage._req_user = req.user;
				newMessage.save((err, message) => {
					if (err) {
						res.err(err, err.name, err.message);
						return;
					}

					// Ajouter le dernier message en lien direct au topic et on incrémente son compteur de reply
					ForumTopic.model.update({
						_id: locals.topic.id
					}, {
						last: message.id,
						$inc: {'stats.replies': 1}
					}).exec(err => {
						if (err) {
							res.err(err, err.name, err.message);
							return;
						}
						res.redirect('/forum-topic/' + locals.topic.key + '#message-last');
					});
					
				});
			} else {
				next();
			}
		});
	}

	// Render the view
	view.render('forum/forum_topic');

};
