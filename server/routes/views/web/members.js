const keystone = require('keystone');
const User = keystone.list('User');
const UserGroup = keystone.list('UserGroup');
const ForumMessage = keystone.list('ForumMessage');
const Promise = require("bluebird");

exports = module.exports = (req, res) => {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	locals.section = 'clan';

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
					.sort({key: 1})
					.select("permissions.groups username starCitizen.isSC key _id connectDate")
					.exec((err, users) => {
						if (err)
							return res.err(err);

						locals.users = users;

						const queries = [];

						users.forEach(user => {
							queries.push(ForumMessage.model.count({
								createdBy: user._id
							}).exec().then(count => {
								user.message_count = count;
							}));
						});
						

						Promise.all(queries).then(() => {
							next();
						}).catch(err => {
							res.err(err, err.name, err.message);
						});
						
					});

			});
	});


	// Render the view
	view.render('web/members');
};
