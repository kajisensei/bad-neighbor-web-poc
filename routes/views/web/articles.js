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

	// On trouve l'id de "article"
	view.on("init", next => {
		const query = Forum.model.findOne({
			"order": -1
		}).select("id");

		query.exec((err, forum) => {
			if (err) {
				res.err(err, err.name, err.message);
				return;
			}
			if (!forum) {
				res.err(err, "No forum with order -1", "A forum with order -1 is needed to be considered as Articles container.");
				return;
			}
			locals.forum = forum;
			next();
		});
	});

	// On chope les articles
	view.on("init", next => {
		const query = ForumTopic.model.find({
			"forum": locals.forum.id
		}).populate("first createdBy").sort({"createdAt": -1}).limit(10);

		query.exec((err, articles) => {
			if (err) {
				res.err(err, err.name, err.message);
				return;
			}

			// Render markdown
			const showdown = require('showdown'),
				xss = require('xss'),
				converter = new showdown.Converter();
			for(const article of articles) {
				article.first.content = xss(converter.makeHtml(article.first.content));
			}

			locals.articles = articles;
			next();
		});
	});


	view.render('web/articles');

};
