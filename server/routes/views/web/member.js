const keystone = require('keystone');
const User = keystone.list("User");
const UserGroup = keystone.list("UserGroup");

exports = module.exports = function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;
	const userKey = req.params['member'];

	// Toujours associer une section pour correctement colorer le menu.
	locals.section = 'members';

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

	// Render the view
	view.render('web/member');
};
