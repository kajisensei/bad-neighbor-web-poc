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

	// Toujours associer une section pour correctement colorer le menu.
	locals.section = 'forums';
	locals.forumKey = req.params['forum'];

	// 0) On vérifie que le gars est loggué
	if (!req.user) {
		req.flash('success', "Vous devez vous authentifier avant d'effectuer cette action.");
		res.redirect('/auth');
		return;
	}

	// 1) On vérifie que le forum existe
	view.on('init', (next) => {
		const query = keystone.list('Forum').model.findOne().where("key").equals(locals.forumKey).exec((err, forum) => {
			if (err) {
				res.err(err, err.name, err.message);
				return;
			}

			if (!forum) {
				// 404 
				res.notfound();
				return;
			}
			locals.forum = forum;
			next();
		});
	});

	// TODO: 2) On vérifie que le gars y ai accès (en lecture mais en droit de post aussi

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
			const newTopic = new ForumTopic.model({
				name: locals.formData.name,
				forum: locals.forum.id,
			});
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
				newMessage.save(err => {
					if (err) {
						res.err(err, err.name, err.message);
						return;
					}

					req.flash('success', 'Sujet créé: ' + locals.formData.name);
					res.redirect('/forum-topic/' + topic.key);
				});
			});

		} else {
			next();
		}
	});

	// Render the view
	view.render('forum/forum_topic_create');

};
