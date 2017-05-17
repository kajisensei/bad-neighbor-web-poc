const keystone = require('keystone');
const ForumTopic = keystone.list('ForumTopic');

exports = module.exports = function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;
	const type = req.query.type;
	locals.searchType = type;

	if (type === "unread") {
		
		if (!req.user || !req.user.readDate) {

			locals.results = [];

		} else {

			view.on('init', function (next) {

				// TODO: restrict access
				ForumTopic.model.find({
					updatedAt: {$gt: req.user.readDate}
				})
					.sort([['updatedAt', -1]])
					.populate('createdBy', 'username key')
					.populate({
						path: 'last',
						populate: {path: 'createdBy'}
					})
					.limit(locals.prefs.forum.topic_per_page)
					.exec((err, results) => {
						if (err) return res.err(err, err.name, err.message);
						locals.results = results;
						next();
					});

			});
		}

	}


	// Render the view
	view.render('forum/forum_search');

};
