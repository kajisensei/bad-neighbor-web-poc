const keystone = require('keystone');
const User = keystone.list('User');
const UserGroup = keystone.list('UserGroup');
const ForumMessage = keystone.list('ForumMessage');
const Promise = require("bluebird");

exports = module.exports = (req, res) => {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	locals.section = 'starcitizen';

	view.on("init", next => {

		// On chope les BN
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
					.where("starCitizen.isSC").equals(true)
					.select("username key _id starCitizen.ships")
					.populate("starCitizen.ships")
					.exec((err, users) => {
						if (err)
							return res.err(err);

						const shipMap = {};
						users.forEach(user => {
							if (user.starCitizen.ships) {
								user.starCitizen.ships.forEach(ship => {
									if (!shipMap[ship.name]) {
										shipMap[ship.name] = [];
									}
									shipMap[ship.name].push(user);
								});
							}
						});
						const shipNames = Object.keys(shipMap);
						shipNames.sort();

						locals.shipNames = shipNames;
						locals.shipMap = shipMap;

						next();

					});

			});
	});


	// Render the view
	view.render('web/fleet');
};
