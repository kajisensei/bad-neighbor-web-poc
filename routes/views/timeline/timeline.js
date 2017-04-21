/*
 Gestion de la logique de la page Ligne du Temps.
 */

let keystone = require('keystone');
let CalendarEntry = keystone.list('CalendarEntry');
let TimelineEntry = keystone.list('TimelineEntry');
let Promise = require("bluebird");

const years_split = 930;

exports = module.exports = (req, res) => {

	let view = new keystone.View(req, res);
	let locals = res.locals;

	// Toujours associer une section pour correctement colorer le menu.
	locals.section = 'timeline';

	// On doit aller chercher deux listes en DB:
	// - Les entrées de ligne du temps
	// - Les entrées de calendrier marquées comme entrées de ligne du temps
	// Vu que les deux listes sont indépendantes, on utilise les Promises pour paralléliser la recherche DB.
	view.on('init', (next) => {
		let queries = [];

		// Lister les entrées timeline
		queries.push(TimelineEntry.model.find().exec().then((list) => {
			locals.timeline_entries = list;
		}));

		// Lister les entrées calendrier marquées comme entrées de ligne du temps
		queries.push(CalendarEntry.model
			.find().where('timeline').exists()
			.where('timeline.isEntry').equals(true)
			.select('timeline startDate')
			.exec().then((list) => {
				locals.calendar_entries = list;
			}));

		// Attendre que les deux Promesses soient finies
		Promise.all(queries).then(() => {
			next();
		}).catch((err) => req.err());
	});

	// Ensuite on analyse et transforme les données
	view.on('init', (next) => {
		// Normalement on a du recevoir deux résultats, au pire vide.
		if(locals.timeline_entries && locals.calendar_entries) {
			
			locals.data = [];
			
			for (let timeline_entry of locals.timeline_entries) {
				locals.data.push({
					key: timeline_entry.key,
					title: timeline_entry.name,
					summary: timeline_entry.summary,
					startDate: timeline_entry.startDate,
					vignette: timeline_entry.vignette && timeline_entry.vignette.secure_url
				});
			}

			for (let calendar_entry of locals.calendar_entries) {
				let timeline = calendar_entry.timeline;
				let scDate = new Date(calendar_entry.startDate);
				scDate.setFullYear(scDate.getFullYear() + years_split);
				locals.data.push({
					key: timeline.key,
					title: timeline.name,
					summary: timeline.summary,
					startDate: scDate,
					realDate: calendar_entry.startDate,
					vignette: timeline.vignette && timeline.vignette.secure_url,
					presence: timeline.presence
				});
			}
			
			// On trie à la fin, par date
			locals.data.sort((a, b) => {
				return b.startDate - a.startDate;
			});
			
			// Date d'aujourd'hui au format SC
			locals.today = new Date();
			locals.today.setFullYear(locals.today.getFullYear() + years_split);
			
		} else {
			// Si c'est pas le cas, c'est qu'il y a eu un problème
			res.err(null, "Error in timeline.js", "Error fetching datas.");
			return;
		}

		next();
	});

	// Render the view
	view.render('timeline/timeline');

};
