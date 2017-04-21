let keystone = require('keystone');

exports = module.exports = function (req, res) {

	let view = new keystone.View(req, res);
	let locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'forums';
	locals.categoryKey = req.params['category'];

	// Check for category
	view.on('init', function (next) {
		let query = keystone.list('ForumCategory').model.findOne({'key': locals.categoryKey});
		query.exec(function (err, category) {
			if (!category) {
				res.notfound();
				return;
			}
			locals.category = category;
			next(err);
		});
	});
	
	// Get all topic from category
	view.on('init', function (next) {
		if (locals.category) {
			let query = keystone.list('ForumTopic').model
				.find({'category': locals.category.id})
				.populate('createdBy', 'username');
			
			query.exec(function (err, topics) {
				locals.topics = topics;
				next(err);
			});
		} else {
			next();
		}
	});

	// Render the view
	view.render('forum/forum');
};
