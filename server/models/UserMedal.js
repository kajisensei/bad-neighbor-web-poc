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
		label: "Icone"
	},

	img: {
		type: String,
		label: "Image"
	},

	onForum: {
		type: Boolean,
		label: 'Visible forum',
		note: "L'icone sera visible sous l'avatar sur les messages de l'utilisateur.",
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
