/**
 * Created by Cossement Sylvain on 24-04-17.
 */
const keystone = require('keystone');
const Promise = require("bluebird");
const Forum = keystone.list('Forum');
const ForumTopic = keystone.list('ForumTopic');
const textUtils = require('../../textUtils');

exports = module.exports = (req, res) => {

	const view = new keystone.View(req, res);
	const locals = res.locals;
	let authors = req.query["authors"];
	let categories = req.query["categories"];

	// Toujours associer une section pour correctement colorer le menu.
	locals.section = 'articles';

	const q = {
		"publish.date": {$exists: true}
	};
	if (authors) {
		q["createdBy"] = {$in: authors.split("-")};
	}
	if (categories) {
		q["publish.category"] = {$in: categories.split("-")};
	}

	// On chope les articles
	view.on("init", next => {
		const query = ForumTopic.model.find(q).populate("createdBy").sort({"publish.date": -1});

		query.exec((err, articles) => {
			if (err) {
				res.err(err, err.name, err.message);
				return;
			}

			const users = {};
			articles.forEach(e => {
				textUtils.convertCategory(e);
				users[e.createdBy.username] = e.createdBy;
			});

			locals.usernames = Object.keys(users);
			locals.usernames.sort((u1, u2) => u1 < u2);
			locals.authors = users;
			locals.articles = articles;
			next();
		});
	});


	view.render('web/articles');

};
