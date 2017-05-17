const keystone = require('keystone');
const ForumTopic = keystone.list('ForumTopic');

exports.header = function (req, res, next) {

	const locals = res.locals;
	const user = locals.user;
	const readDate = user.readDate || null;

	if (!user)
		return next();

	user.mp_count = 0;
	user.event_count = 0;

	const query = {};
	if (readDate) {
		query.updatedAt = {$gt: readDate};
	}
	ForumTopic.model.count(query).exec((err, count) => {
		if (err) return res.err(err, "Forum middleware", "Counting unread");

		user.unread_count = count;

		next();
	});

};
