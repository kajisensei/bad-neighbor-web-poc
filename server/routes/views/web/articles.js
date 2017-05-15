/**
 * Created by Cossement Sylvain on 24-04-17.
 */
const keystone = require('keystone');
const Promise = require("bluebird");
const Forum = keystone.list('Forum');
const ForumTopic = keystone.list('ForumTopic');
const ForumMessage = keystone.list('ForumMessage');

exports = module.exports = (req, res) => {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	// Toujours associer une section pour correctement colorer le menu.
	locals.section = 'articles';

	// On chope les articles
	view.on("init", next => {
		const query = ForumTopic.model.find({
			"publish.date": {$exists: true}
		}).populate("createdBy").sort({"publish.date": -1}).limit(50);

		query.exec((err, articles) => {
			if (err) {
				res.err(err, err.name, err.message);
				return;
			}

			locals.articles = articles;
			next();
		});
	});
	

	view.render('web/articles');

};
