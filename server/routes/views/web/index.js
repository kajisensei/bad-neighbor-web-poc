const textUtils = require('../../textUtils');
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

		const queries = [];
		queries.push(ForumTopic.model.find({
			"publish.date": {$exists: true}
		}).populate("createdBy").sort({"publish.date": -1}).limit(16).exec().then(articles => {
			articles.forEach(e => {
				textUtils.convertCategory(e);
			});
			locals.articles = articles;
		}));

		queries.push(ForumTopic.model.find({
			"selection.date": {$exists: true},
			"selection.category": 'sc'
		}).sort({"selection.date": -1}).limit(5).exec().then(selectionSC => {
			locals.selectionSC = selectionSC;
		}));

		queries.push(ForumTopic.model.find({
			"selection.date": {$exists: true},
			"selection.category": 'jv'
		}).sort({"selection.date": -1}).limit(5).exec().then(selectionJV => {
			locals.selectionJV = selectionJV;
		}));

		queries.push(ForumTopic.model.find({
			"selection.date": {$exists: true},
			"selection.category": 'bn'
		}).sort({"selection.date": -1}).limit(5).exec().then(selectionBN => {
			locals.selectionBN = selectionBN;
		}));

		Promise.all(queries).then(() => {
			next();
		}).catch(err => {
			console.log(err);
			res.err(err, err.name, err.message);
		});

	});
	
	locals.videoYT = "Jb2n95HF8Lo";
	

	// Render the view
	view.render('web/index');
};
