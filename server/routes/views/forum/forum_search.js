const keystone = require('keystone');
const ForumTopic = keystone.list('ForumTopic');
const Forum = keystone.list('Forum');
const rightsUtils = require("../../rightsUtils.js");

exports = module.exports = function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;
	const type = req.query.type;
	const expression = req.query.expression;
	locals.searchType = type;
	locals.expression = expression;
	locals.results = [];

	// Trouver les forums permis
	view.on('init', function (next) {
		Forum.model.find({})
			.select("read tags")
			.populate("tags")
			.exec((err, forums) => {
				if (err) return res.err(err, err.name, err.message);

				locals.allowedForumIds = [];
				locals.excludedTags = new Set();
				
				forums.forEach(forum => {
					if (!forum.read.length || (locals.user && rightsUtils.canXXX("read", forum, locals.user)))
						locals.allowedForumIds.push(forum._id);
					
					rightsUtils.getExcludedTags(locals.user, forum.tags).forEach(d => locals.excludedTags.add(d));
				});
				
				next();
			});
	});

	// On ne cherche que dans les forums permis
	view.on('init', function (next) {

		const query = {
			forum: {$in: locals.allowedForumIds},
			tags: {$nin: [...locals.excludedTags]}
		};

		if (type === "unread" && req.user && req.user.readDate) {
			query["updatedAt"] = {$gt: req.user.readDate};
			query["views"] = {$ne: req.user.id};
		}

		if (expression) {
			query["name"] = {'$regex': expression, $options: 'i'}
		}

		ForumTopic.model.find(query)
			.sort([['updatedAt', -1]])
			.populate('createdBy', 'username key')
			.populate({
				path: 'last',
				populate: {path: 'createdBy'}
			})
			.limit(locals.prefs.forum.topic_per_search)
			.exec((err, results) => {
				if (err) return res.err(err, err.name, err.message);
				locals.results = results;
				next();
			});

	});


	// Render the view
	view.render('forum/forum_search');

};
