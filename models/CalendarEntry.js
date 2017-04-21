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
	autokey: {from: 'timeline.name', path: 'timeline.key', unique: true},
	track: true,
	map: {
		name: 'text',
	}
});

CalendarEntry.add("Calendrier", {

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
	
}, "Ligne du temps", {
	
	timeline: {

		isEntry: {
			type: Boolean,
			label: "Entrée ligne du temps",
			note: "Ajoute l'évènement à la ligne du temps BN. La date de l'évènement sera convertie en date SC (29xx).",
		},

		name: {
			type: String,
			label: "Titre",
			dependsOn: { "timeline.isEntry": true}
		},

		vignette: {
			type: Types.CloudinaryImage,
			label: "Vignette",
			autoCleanup : true,
			dependsOn: { "timeline.isEntry": true}
		},

		summary: {
			type: Types.Textarea,
			label: "Résumé",
			dependsOn: { "timeline.isEntry": true}
		},

		presence: {
			type: Types.Relationship,
			ref: 'User',
			many: true,
			label: "Utilisateurs présents",
			dependsOn: { "timeline.isEntry": true}
		},

		contenu: {
			type: Types.Html,
			wysiwyg: true,
			height: 250,
			label: "Texte détaillé",
			dependsOn: { "timeline.isEntry": true},
			note: "Une fois uploadée ci-dessous, l'image doit encore être insérée dans le texte avec une balise img.",
		},

		images: {
			type: Types.CloudinaryImages,
			label: "Upload d'images",
			autoCleanup : true,
			dependsOn: { "timeline.isEntry": true}
		},
		
	}

});

/**
 * Registration
 */
CalendarEntry.defaultSort = '-startDate';
CalendarEntry.defaultColumns = 'text, startDate, endDate, public';
CalendarEntry.register();
