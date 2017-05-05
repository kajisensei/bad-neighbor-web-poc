/**
 * Created by Syl on 20-04-17.
 */
var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * CalendarEntry
 * ==========
 */
var TimelineEntry = new keystone.List('TimelineEntry', {
	label: "Entrée ligne du temps",
	singular: "Entrée ligne du temps",
	plural: "Entrées ligne du temps",
	autokey: {from: 'name', path: 'key', unique: true},
	track: true,
});

TimelineEntry.add({

	name: {
		type: String,
		initial: true,
		required: true,
		label: "Titre de l'entrée"
	},

	startDate: {
		type: Types.Datetime,
		default: Date.now,
		initial: true,
		required: true,
		format: "mm/dd/yyyy HH:MM",
		label: "Date de l'entrée",
	},

	vignette: {
		type: Types.CloudinaryImage,
		label: "Vignette",
		autoCleanup : true,
	},

	summary: {
		type: Types.Html,
		wysiwyg: true,
		height: 250,
		label: "Texte",
	},

});

/**
 * Registration
 */
TimelineEntry.defaultSort = '-startDate';
TimelineEntry.defaultColumns = 'name, startDate, summary';
TimelineEntry.register();
