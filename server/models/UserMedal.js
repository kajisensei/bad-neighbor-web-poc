const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * User Medal Model
 * ==========
 */
const UserMedal = new keystone.List('UserMedal', {
	label: "Médaille",
	plural: "Médailles",
	autokey: { from: 'name', path: 'key', unique: true }
});

UserMedal.add({
	
	name: {
		type: String,
		initial: true,
		required: true,
		label: "Nom"
	},

	description: {
		type: String,
		initial: true,
		required: true,
		label: "Description"
	},

	icon: {
		type: String,
		label: "Icone",
		note: `Utiliser l'URL d'une image de la librairie. Donc ca commence par /images/library-`
	},
	
});


/**
 * Relationships
 */
UserMedal.relationship({ref: 'User', path: 'users', refPath: 'medals'});

/**
 * Registration
 */
UserMedal.defaultSort = 'name';
UserMedal.defaultColumns = 'name, description';
UserMedal.register();
