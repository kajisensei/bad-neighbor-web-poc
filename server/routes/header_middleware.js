const keystone = require('keystone');
const ForumTopic = keystone.list('ForumTopic');
const User = keystone.list('User');
const CalendarEntry = keystone.list('CalendarEntry');
const Promise = require("bluebird");
const discord = require("./../apps/DiscordBot.js");

const rightTable = ["calendar", "calendar-admin", "generic-content", "image-library"];

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

	// Chargement des groupes && droits + couleur principale du user
	{
		queries.push(User.model.findOne({_id: user._id}).select("permissions.groups").populate("permissions.groups").exec().then((user) => {
			user.permissions.groups.sort((a, b) => {
				if (a.order < b.order)
					return -1;
				if (a.order > b.order)
					return 1;
				return 0;
			});

			// Inject group global rights
			res.locals.rightKeysSet = new Set();
			user.permissions.groups.forEach(group => {
				(rightTable).forEach(right => {
					if (group.rights[right])
						res.locals.rightKeysSet.add(right);
				});
			});

			// Au moins un groupe BN, donc le gars est BN
			let isBN = false;
			let color;
			user.permissions.groups.forEach(g => {
				if (g.isBN) {
					if (!color)
						color = g.color;
					isBN = true;
				}
			});
			locals.user.isBN = isBN;
			locals.user.color = color;
		}));
	}

	locals.discord_users = discord.getOnlineUsers();
	user.discord_count = locals.discord_users.length;

	// Maj async de la présence
	User.model.update({_id: user._id}, {connectDate: new Date()}, err => {
	});

	Promise.all(queries).then(() => {
		next();
	}).catch(err => {
		res.err(err, err.name, err.message);
	});

};
