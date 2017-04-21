/**
 * Created by Syl on 20-04-17.
 */
var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * CalendarEntry
 * ==========
 */
var CalendarEntry = new keystone.List('CalendarEntry', {
	label: "Entrée calendrier",
	plural: "Entrées calendrier",
	track: true,
	map: {
		name: 'text',
	}
});

CalendarEntry.add({

	text: {
		type: String,
		initial: true,
		required: true,
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

});

/**
 * Registration
 */
CalendarEntry.defaultSort = '-createdAt';
CalendarEntry.defaultColumns = 'text, startDate, endDate, public';
CalendarEntry.register();
