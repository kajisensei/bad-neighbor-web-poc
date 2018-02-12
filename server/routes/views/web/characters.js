const keystone = require('keystone');
const User = keystone.list('User');
const UserGroup = keystone.list('UserGroup');

exports = module.exports = (req, res) => {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	locals.section = 'starcitizen';

	view.on("init", next => {

		// On chope les groupes BN
		UserGroup.model.find({
			["isBN"]: true
		}).select("_id")
			.exec((err, groups) => {
				if (err)
					return res.err(err);

				locals.groupsId = [];
				groups.forEach(g => locals.groupsId.push(String(g._id)));

				next();
			});
	});

	view.on("init", next => {

		// On chope les joueurs ayant un perso SC
		User.model.find({
			["starCitizen.isSC"]: true,
			["permissions.groups"]: {$in: locals.groupsId}
		})
			.sort({["starCitizen.character"]: 1})
			.populate("starCitizen.jobs starCitizen.ships")
			.exec((err, players) => {
				if (err)
					return res.err(err);

				locals.players = players;
				locals.players.sort((a, b) => {
					return a.starCitizen.character.full.localeCompare(b.starCitizen.character.full);
				});

				next();
			});
	});


	// Render the view
	view.render('web/characters');
};
