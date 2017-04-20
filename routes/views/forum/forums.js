var keystone = require('keystone');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'forums';

	// Get all forum categories
	view.on('init', function (next) {

		var query = keystone.list('ForumCategory').model.find({});
		query.sort({ order: 1 });
		
		query.exec(function (err, categories) {
			if(!categories)
				throw "Null results for categories";
				
			let groups = {};
			let groupOrder = [];
			for (let category of categories) {
				if (!groups[category.group]) {
					groups[category.group] = [];
					groupOrder.push(category.group);
				}
				groups[category.group].push(category);
			}
			
			locals.groups = groups;
			locals.groupOrder = groupOrder;
			
			next(err);
		});

	});

	// Render the view
	view.render('forum/forums');
};
