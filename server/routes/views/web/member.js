const keystone = require('keystone');
const User = keystone.list("User");
const UserGroup = keystone.list("UserGroup");
const ForumTopic = keystone.list('ForumTopic');
const ForumMessage = keystone.list('ForumMessage');

exports = module.exports = function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;
	const userKey = req.params['member'];

	// Toujours associer une section pour correctement colorer le menu.
	locals.section = 'clan';

	view.on("init", next => {

		// On vérifie que le user existe
		User.model.findOne()
			.where("key").equals(userKey)
			.populate("permissions.groups starCitizen.jobs starCitizen.ships")
			.exec((err, user) => {
				if (err)
					return res.err(err);

				if (!user) {
					return res.notfound();
				}

				locals.member = user;

				// Render markdown
				const showdown = require('showdown'),
					xss = require('xss'),
					converter = new showdown.Converter();
				if (user.starCitizen && user.starCitizen.description) {
					user.starCitizen.description = xss(converter.makeHtml(user.starCitizen.description));
				}
				if (user.sign) {
					user.sign = xss(converter.makeHtml(user.sign));
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

		Promise.all(queries).then(() => {
			next();
		}).catch(err => {
			res.err(err, err.name, err.message);
		});
		
	});

	// Render the view
	view.render('web/member');
};
