const keystone = require('keystone');
const User = keystone.list('User');

exports = module.exports = (req, res) => {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	locals.section = 'starcitizen';

	view.on("init", next => {
		
		// On chope les joueurs ayant un perso SC
		User.model.find({
			["starCitizen.isSC"]: true
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
