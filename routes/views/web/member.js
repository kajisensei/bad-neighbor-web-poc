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
				
				next();
			});

	});

	// Render the view
	view.render('web/member');
};
