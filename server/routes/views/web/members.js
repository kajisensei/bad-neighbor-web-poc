const keystone = require('keystone');
const User = keystone.list('User');
const UserGroup = keystone.list('UserGroup');

exports = module.exports = (req, res) => {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	locals.section = 'members';

	view.on("init", next => {
		
		// On chope les groupes BN
		UserGroup.model.find({
			isBN: true
		})
			.sort({order: 1})
			.exec((err, groups) => {
				if (err)
					return res.err(err);

				const groupsIds = [];
				groups.forEach(group => groupsIds.push(group._id));

				locals.groups = groups;
				locals.groupsIds = groupsIds;

				// On chope les utilisateurs appartenant à ces groupes
				User.model.find()
					.where("permissions.groups").in(groupsIds)
					.select("permissions.groups username starCitizen.isSC key _id")
					.exec((err, users) => {
						if (err)
							return res.err(err);

						locals.users = users;

						next();
					});

			});
	});


	// Render the view
	view.render('web/members');
};
