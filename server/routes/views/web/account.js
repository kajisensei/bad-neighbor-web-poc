const keystone = require('keystone');
const User = keystone.list("User");
const UserGroup = keystone.list("UserGroup");
const SCJob = keystone.list('SCJob');
const SCShip = keystone.list('SCShip');

exports = module.exports = function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	// On chope les jobs et les ships de la DB
	view.on("init", next => {

		const queries = [];

		queries.push(SCJob.model.find({}).sort({"name": 1}).exec().then(jobs => {
			locals.jobs = jobs;
		}));

		queries.push(SCShip.model.find({}).sort({"name": 1}).exec().then(ships => {
			locals.ships = ships;
		}));
		
		Promise.all(queries).then(() => {
			next();
		}).catch(err => {
			console.log(err);
			res.err(err, err.name, err.message);
		});
		
	});

	// Render the view
	view.render('web/account');
};
