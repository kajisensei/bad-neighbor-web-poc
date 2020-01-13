const textUtils = require('../../textUtils');
const keystone = require('keystone');
const Promise = require("bluebird");
const Forum = keystone.list('Forum');
const ForumTopic = keystone.list('ForumTopic');
const ForumMessage = keystone.list('ForumMessage');
const GenericPage = keystone.list('GenericPage');

exports = module.exports = function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'home';

	// On chope les messages publiés
	view.on("init", next => {

		const queries = [];
		queries.push(ForumTopic.model.find({
			"publish.date": {$exists: true}
		}).populate("createdBy").sort({"publish.date": -1}).limit(16).exec().then(articles => {
			articles.forEach(e => {
				textUtils.convertCategory(e);
			});
			locals.articles = articles;
		}));

		queries.push(GenericPage.model.findOne().where('key', "video-du-moment").exec().then(video => {
			locals.video = video;
		}));

		Promise.all(queries).then(() => {
			next();
		}).catch(err => {
			console.log(err);
			res.err(err, err.name, err.message);
		});

	});

	// Render the view
	view.render('web/index');
};
