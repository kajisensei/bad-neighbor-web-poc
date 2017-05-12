const keystone = require('keystone');
const Promise = require("bluebird");
const Forum = keystone.list('Forum');
const ForumTopic = keystone.list('ForumTopic');
const ForumMessage = keystone.list('ForumMessage');

exports = module.exports = function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'home';

	// On chope les messages publiés
	view.on("init", next => {
		const query = ForumTopic.model.find({
			"publish.date": {$exists: true}
		}).populate("createdBy").sort({"publish.date": -1}).limit(14);

		query.exec((err, articles) => {
			if (err) {
				res.err(err, err.name, err.message);
				return;
			}

			locals.articles = articles;
			next();
		});
	});

	// Render the view
	view.render('web/index');
};
