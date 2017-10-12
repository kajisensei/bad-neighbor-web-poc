const keystone = require('keystone');
const ForumTopic = keystone.list('ForumTopic');
const CalendarEntry = keystone.list('CalendarEntry');
const Promise = require("bluebird");
const discord = require("./../apps/DiscordBot.js");

exports.header = function (req, res, next) {

	const locals = res.locals;
	const user = locals.user;

	if (!user)
		return next();

	const readDate = user.readDate || null;

	user.mp_count = 0;
	user.event_count = 0;

	const queries = [];

	// Nouveaux messages forums
	{
		const query = {};
		if (readDate) {
			query.updatedAt = {$gt: readDate};
			query.views = {$ne: user.id};
		}
		queries.push(ForumTopic.model.count(query).exec().then((count) => {
			user.unread_count = count;
		}));
	}

	// Evenements à venir
	{
		const query = {
			$or: [
				{'public': true},
				{'invitations': locals.user._id},
				{'createdBy': locals.user._id}
			],
			startDate: {$gt: new Date()}
		};
		
		queries.push(CalendarEntry.model.count(query).exec().then((count) => {
			user.event_count = count;
		}));
	}

	locals.discord_users = discord.getOnlineUsers();
	user.discord_count = locals.discord_users.length;

	Promise.all(queries).then(() => {
		next();
	}).catch(err => {
		res.err(err, err.name, err.message);
	});

};
