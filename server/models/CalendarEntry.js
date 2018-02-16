/**
 * Created by Syl on 20-04-17.
 */
const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * CalendarEntry
 * ==========
 */
const CalendarEntry = new keystone.List('CalendarEntry', {
	label: "Entrée calendrier",
	plural: "Entrées calendrier",
	autokey: {from: 'timeline.name', path: 'timeline.key', unique: true},
	track: true,
	map: {
		name: 'title',
	}
});

CalendarEntry.add("Calendrier", {

	title: {
		type: String,
		label: "Titre de l'entrée"
	},

	text: {
		type: Types.Textarea,
		label: "Texte de l'entrée"
	},

	startDate: {
		type: Types.Datetime,
		default: Date.now,
		initial: true,
		required: true,
		format: "mm/dd/yyyy HH:MM",
		label: "Date de commencement",
	},

	endDate: {
		type: Types.Datetime,
		default: Date.now,
		initial: true,
		required: true,
		format: "mm/dd/yyyy HH:MM",
		label: "Date de fin",
	},

	public: {
		type: Boolean,
		initial: true,
		label: "Public",
		note: "Une entrée publique sera visible par tout le monde. Une privée ne sera visible que par les utilisateurs/groupes invités à l'évènement.",
	},

	// open: {
	// 	type: Boolean,
	// 	initial: true,
	// 	label: "Ouvert",
	// 	note: "Un évènement ouvert laisse à tout le monde la possibilité de s'inscrire, même si ils ne sont pas directement invités.",
	// },

	groups: {
		type: Types.Relationship,
		ref: 'UserGroup',
		many: true,
		label: "Groupes invités",
	},

	invitations: {
		type: Types.Relationship,
		ref: 'User',
		many: true,
		label: "Utilisateurs invités",
	},

	present: {
		type: Types.Relationship,
		ref: 'User',
		many: true,
		label: "Inscription: Acceptés",
	},

	maybe: {
		type: Types.Relationship,
		ref: 'User',
		many: true,
		label: "Inscription: Peut-être",
	},

	away: {
		type: Types.Relationship,
		ref: 'User',
		many: true,
		label: "Inscription: Refusés",
	},
	
});

/**
 * Registration
 */
CalendarEntry.defaultSort = '-startDate';
CalendarEntry.defaultColumns = 'title, text, startDate, endDate, public';
CalendarEntry.register();
