const keystone = require('keystone');
const Promise = require("bluebird");

exports = module.exports = function (req, res) {

	let view = new keystone.View(req, res);
	let locals = res.locals;

	// Toujours associer une section pour correctement colorer le menu.
	locals.section = 'forums';

	// Get all forum categories
	view.on('init', function (next) {

		// TODO: Restreindre aux forum auxquels on a accès
		let query = keystone.list('Forum').model.find({});
		query.sort({order: 1});

		query.exec(function (err, forums) {
			if (err) {
				res.err(err, err.name, err.message);
				return;
			}

			let groups = {};
			let groupOrder = [];
			for (let forum of forums) {
				if (!groups[forum.group]) {
					groups[forum.group] = [];
					groupOrder.push(forum.group);
				}
				groups[forum.group].push(forum);
			}

			locals.forums = forums;
			locals.groups = groups;
			locals.groupOrder = groupOrder;

			next();
		});

	});
	
	// Count #topics for each forum
	view.on('init', function (next) {
		
		if (locals.forums) {

			let queries = [];
			for (let forum of locals.forums) {
				queries.push(keystone.list('ForumTopic').model.count({
					category: forum.id
				}).exec().then(function(count){
					forum.topics = count;
				}));
			}
			
			Promise.all(queries).then(function() {
				next();
			});
			
		}
		
	});

	// Render the view
	view.render('forum/forums');
};
