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
	locals.articleKey = req.params['article'];

	// On chope l'article
	view.on("init", next => {
		const query = ForumTopic.model.findOne({
			"key": locals.articleKey
		}).populate("first createdBy");

		query.exec((err, article) => {
			if (err) {
				res.err(err, err.name, err.message);
				return;
			}
			if (!article) {
				res.notfound();
				return;
			}

			// Render markdown
			const showdown = require('showdown'),
				xss = require('xss'),
				converter = new showdown.Converter();
			article.first.content = xss(converter.makeHtml(article.first.content));
			
			locals.article = article;
			next();
		});
	});

	// TODO: On chope les commentaires



	view.render('web/article');

};
