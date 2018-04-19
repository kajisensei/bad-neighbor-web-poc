const keystone = require('keystone');
const User = keystone.list("User");
const UserGroup = keystone.list("UserGroup");
const ForumTopic = keystone.list('ForumTopic');
const ForumMessage = keystone.list('ForumMessage');
const textUtils = require('../../textUtils');
const discord = require("./../../../apps/DiscordBot.js");

exports = module.exports = function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;
	const user = locals.user;
	const userKey = req.params['member'];

	// Toujours associer une section pour correctement colorer le menu.
	locals.section = 'clan';

	view.on("init", next => {

		// On vérifie que le user existe
		User.model.findOne({key: {$regex: `^${userKey}$`, $options: 'i'}})
			.populate("permissions.groups starCitizen.jobs starCitizen.ships medals")
			.exec((err, user) => {
				if (err)
					return res.err(err);

				if (!user) {
					return res.notfound();
				}

				locals.member = user;
				user.permissions.groups.sort((a, b) => a.order - b.order);

				if (user.personnal.discord) {
					user.presence = discord.getUserPresence(user.personnal.discord);
				}

				// Render markdown
				if (user.starCitizen && user.starCitizen.description) {
					user.starCitizen.description = textUtils.markdownize(user.starCitizen.description);
				}
				if (user.sign) {
					user.sign = textUtils.markdownize(user.sign);
				}

				next();
			});

	});

	// On chope ses topic et messages
	view.on("init", next => {

		const queries = [];

		// Les topic
		queries.push(ForumTopic.model.find({
				"createdBy": locals.member.id
			})
				.sort({'updatedAt': -1}).limit(locals.prefs.member.last_count)
				.exec()
				.then((topics) => {
					locals.topics = topics;
				})
		);

		// Les messages
		queries.push(ForumMessage.model.find({
				"createdBy": locals.member.id
			})
				.sort({'updatedAt': -1}).limit(locals.prefs.member.last_count)
				.populate('topic')
				.exec()
				.then((messages) => {
					locals.mess = messages;
				})
		);

		// Les IP si on est admin
		if (user && user.permissions.isAdmin) {
			queries.push(ForumMessage.model.find({
					"createdBy": locals.member.id
				})
					.sort({'updatedAt': -1})
					.select('author_ip')
					.exec()
					.then((messages) => {
						const ips = new Set();
						messages.forEach(m => {
							ips.add(m.author_ip);
						});
						locals.ips = [...ips].sort();
					})
			);
		}


		Promise.all(queries).then(() => {
			next();
		}).catch(err => {
			res.err(err, err.name, err.message);
		});

	});

	// Render the view
	view.render('web/member');
};
