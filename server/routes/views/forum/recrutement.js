/*
 Formulaire de recrutement
 */

const keystone = require('keystone');
const Promise = require("bluebird");
const SCJob = keystone.list('SCJob');
const SCShip = keystone.list('SCShip');
const GenericPage = keystone.list('GenericPage');
const showdown = require('showdown'),
	xss = require('xss'),
	converter = new showdown.Converter();

exports = module.exports = (req, res) => {

	const view = new keystone.View(req, res);
	const locals = res.locals;
	const user = locals.user;

	locals.section = 'recrutement';
	if (user && user.personnal && user.personnal.birthday) {
		locals.defaultAge = Math.round((new Date() - user.personnal.birthday) / (1000 * 3600 * 24 * 365));
	} else {
		locals.defaultAge = "";
	}


	view.on('init', (next) => {
		// choper les textes
		const queries = [];

		// Premier texte recrutement "Qui sont les BN en vrai?"
		queries.push(GenericPage.model.findOne({
				"key": "recrutement-qui"
			})
				.exec()
				.then((text) => {
					if (text)
						locals.text1 = xss(converter.makeHtml(text.contenu));
				})
		);

		// Deuxième texte recrutement "Règlement"
		queries.push(GenericPage.model.findOne({
				"key": "recrutement-reglement"
			})
				.exec()
				.then((text) => {
					if (text)
						locals.text2 = xss(converter.makeHtml(text.contenu));
				})
		);

		queries.push(SCJob.model.find({}).exec().then(jobs => {
			const jobMap = {};
			for (const job of jobs) {
				jobMap[job.id] = job;
			}
			const jobsString = [];
			if (user && user.starCitizen.jobs)
				user.starCitizen.jobs.forEach(job => jobsString.push(jobMap[job] && jobMap[job].name || "?"));
			else
				jobsString.push("Aucune");
			locals.jobs = jobsString;
		}));

		queries.push(SCShip.model.find({}).exec().then(ships => {
			const shipMap = {};
			for (const ship of ships) {
				shipMap[ship.id] = ship;
			}
			const shipsString = [];
			if (user && user.starCitizen.ships)
				user.starCitizen.ships.forEach(ship => shipsString.push(shipMap[ship] && shipMap[ship].name || "?"));
			else
				shipsString.push("Aucun");
			locals.ships = shipsString;
		}));

		Promise.all(queries).then(() => {
			next();
		}).catch(err => {
			console.log(err);
			res.err(err, err.name, err.message);
		});
	});

	// Render the view
	view.render('forum/recrutement');
};
