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
				if(e.publish.category === "sc")
					e.publish.category = "Star Citizen";
				else if(e.publish.category === "hd")
					e.publish.category = "Hardware";
				else if(e.publish.category === "jv")
					e.publish.category = "Jeux vidéo";
				else if(e.publish.category === "bn")
					e.publish.category = "Bad Neighbor";
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
			"selection.category": 'hd'
		}).sort({"selection.date": -1}).limit(5).exec().then(selectionHD => {
			locals.selectionHD = selectionHD;
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
