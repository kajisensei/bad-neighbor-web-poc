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
	const user = locals.user;
	
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

				// Vérifier qu'on y ai accès. Si non => redirect
				const forumRights = [];
				forum.read.forEach(e => forumRights.push(String(e)));
				const canRead = forumRights.length === 0 || (user && user.permissions.groups.find(e => forumRights.includes(String(e))) !== undefined)
				if(!canRead) {
					req.flash('error', "Vous n'avez pas accès à ce forum.");
					return res.redirect("/forums");
				}

				// Droit de creation de sujet
				const canCreateRights = [];
				forum.write.forEach(e => canCreateRights.push(String(e)));
				const canCreate = forum.write.length === 0 || (user.permissions.groups.find(e => canCreateRights.includes(String(e))) !== undefined);
				if (!canCreate) {
					req.flash('error', "Vous n'avez pas le droit de créer un sujet dans ce forum.");
					return res.redirect("/forums");
				}

				locals.forum = forum;
				next();
			});
	});

	// Render the view
	view.render('forum/forum_topic_create');

};
