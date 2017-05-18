/**
 * Created by Cossement Sylvain on 22-04-17.
 */
const keystone = require('keystone');
const Promise = require("bluebird");
const ForumTopic = keystone.list('ForumTopic');
const ForumMessage = keystone.list('ForumMessage');

exports = module.exports = (req, res) => {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	/**
	 * DISPLAY
	 */

	// Toujours associer une section pour correctement colorer le menu.
	locals.section = 'forums';
	locals.forumKey = req.params.forum;

	// 1) On vérifie que le forum existe
	view.on('init', (next) => {
		const query = keystone.list('Forum').model.findOne({key: locals.forumKey})
			.populate("tags")
			.exec((err, forum) => {
				if (err) return res.err(err, err.name, err.message);

				if (!forum) {
					res.notfound();
					return;
				}
				locals.forum = forum;
				next();
			});
	});

	// TODO: 2) On vérifie que le gars y ai accès (en lecture mais en droit de post aussi

	/**
	 * ACTIONS
	 */

	locals.formData = req.body || {};
	locals.validationErrors = {};

	const validation = () => {
		if (!locals.formData.name) {
			locals.validationErrors.name = true;
			req.flash('error', "Le titre ne peut pas être vide.");
		}
		if (!locals.formData.message) {
			locals.validationErrors.message = true;
			req.flash('error', "Le corps du message ne peut pas être vide.");
		}
		// TODO: vérifier que le titre les dispo (forum + slug titre)
		// TODO: Vérification sur la longueur du post ?
	};

	// Action "Preview"
	view.on('post', {action: 'create-post', preview: ''}, next => {
		validation();

		// Si pas d'erreur de validation
		if (!Object.keys(locals.validationErrors).length) {

			// Render markdown
			const showdown = require('showdown'),
				xss = require('xss'),
				converter = new showdown.Converter(),
				text = locals.formData.message;
			locals.preview = xss(converter.makeHtml(text));
		}
		next();
	});

	// Action "Save"
	view.on('post', {action: 'create-post', save: ''}, next => {
		validation();

		// Si pas d'erreur de validation
		if (!Object.keys(locals.validationErrors).length) {
			// TODO: Créer un brouillon

			req.flash('success', 'Brouillon sauvegardé: ' + locals.formData.name);
		}
		next();
	});

	// Action "Post"
	view.on('post', {action: 'create-post', post: ''}, next => {
		validation();

		// Si pas d'erreur de validation
		if (!Object.keys(locals.validationErrors).length) {

			// TODO: vérifier que le nom de sujet est dispo

			// Créer le sujet
			const model = {
				name: locals.formData.name,
				forum: locals.forum.id,
				views: [req.user.id]
			};
			if (locals.formData.tag && locals.formData.tag !== "none") {
				model.tag = locals.formData.tag;
			}
			const newTopic = new ForumTopic.model(model);
			newTopic._req_user = req.user;
			newTopic.save((err, topic) => {
				if (err) {
					res.err(err, err.name, err.message);
					return;
				}

				// Créer le premier message
				const newMessage = new ForumMessage.model({
					content: locals.formData.message,
					author: req.user.username,
					topic: topic.id
				});
				newMessage._req_user = req.user;
				newMessage.save((err, message) => {
					if (err) {
						res.err(err, err.name, err.message);
						return;
					}

					// Ajouter le premier message en lien direct au topic 
					ForumTopic.model.update({
						_id: topic.id
					}, {
						first: message.id,
						last: message.id
					}).exec(err => {
						if (err) {
							res.err(err, err.name, err.message);
							return;
						}

						req.flash('success', 'Sujet créé: ' + locals.formData.name);
						res.redirect('/forum-topic/' + topic.key);
					});

				});
			});

		} else {
			next();
		}
	});

	// Render the view
	view.render('forum/forum_topic_create');

};
