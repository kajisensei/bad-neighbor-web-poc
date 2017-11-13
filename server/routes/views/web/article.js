/**
 * Created by Cossement Sylvain on 24-04-17.
 */
const keystone = require('keystone');
const Promise = require("bluebird");
const Forum = keystone.list('Forum');
const ForumTopic = keystone.list('ForumTopic');
const ForumMessage = keystone.list('ForumMessage');
const textUtils = require('../../textUtils');

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

			textUtils.convertCategory(article);

			// Render markdown
			article.first.content = textUtils.markdownize(article.first.content);

			locals.article = article;
			next();
		});
	});

	// On chope les commentaires (sauf le premier qui correspond à l'article en soi)
	view.on("init", next => {

		const query = ForumMessage.model.find({
			"topic": locals.article.id,
			"_id": {$ne: locals.article.first.id}
		}).sort({"createdAt": -1}).populate("createdBy").limit(50);

		query.exec((err, messages) => {
			if (err) {
				res.err(err, err.name, err.message);
				return;
			}

			// Render markdown
			for (const message of messages) {
				message.content = textUtils.markdownize(message.content);
			}

			locals.mess = messages;
			next();
		});
	});


	view.render('web/article');

};
