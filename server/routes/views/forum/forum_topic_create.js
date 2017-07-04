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

	// Render the view
	view.render('forum/forum_topic_create');

};
