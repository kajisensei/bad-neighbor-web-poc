/**
 * Created by Cossement Sylvain on 22-04-17.
 */
const keystone = require('keystone');
const Forum = keystone.list('Forum');
const ForumTopicTemplate = keystone.list('ForumTopicTemplate');
const rightsUtils = require("../../rightsUtils.js");

exports = module.exports = (req, res) => {

	const view = new keystone.View(req, res);
	const locals = res.locals;
	const user = locals.user;
	
	/**
	 * DISPLAY
	 */

	// Toujours associer une section pour correctement colorer le menu.
	locals.section = 'forums';
	locals.forumKey = req.params.forum;

	// 1) On vérifie que le forum existe
	view.on('init', (next) => {
		Forum.model.findOne({key: locals.forumKey})
			.populate("tags")
			.exec((err, forum) => {
				if (err) return res.err(err, err.name, err.message);

				if (!forum) {
					res.notfound();
					return;
				}

				// Vérifier qu'on y ai accès. Si non => redirect
				if(!rightsUtils.canXXX("read", forum, user)) {
					req.flash('error', "Vous n'avez pas accès à ce forum.");
					return res.redirect("/forums");
				}

				// Droit de creation de sujet
				if (!rightsUtils.canXXX("write", forum, user)) {
					req.flash('error', "Vous n'avez pas le droit de créer un sujet dans ce forum.");
					return res.redirect("/forums");
				}

				locals.excludedTags = rightsUtils.getExcludedTags(user, forum.tags);

				locals.forum = forum;
				next();
			});
	});

	// 2) On liste les templates
	view.on('init', (next) => {
		ForumTopicTemplate.model.find({})
			.exec((err, templates) => {
				if (err) return res.err(err, err.name, err.message);
				locals.templates = templates;
				locals.templates_string = JSON.stringify(templates);
				next();
			});
	});

	

	// Render the view
	view.render('forum/forum_topic_create');

};
