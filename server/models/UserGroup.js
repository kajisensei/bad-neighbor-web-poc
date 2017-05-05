var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * User Group Model
 * ==========
 */
var UserGroup = new keystone.List('UserGroup', {
	label: "Groupe utilisateur",
	plural: "Groupes utilisateur",
	autokey: { from: 'name', path: 'key', unique: true }
});

UserGroup.add({
	
	name: {
		type: String,
		initial: true,
		required: true,
		label: "Nom du groupe"
	},

	isBN: {
		type: Boolean,
		initial: true,
		required: true,
		label: "Groupe BN",
		note: "Les groupes BN seront listés sur les pages /members et /characters. Aussi seuls les utilisateurs de groupes BN peuvent configurer leur personnage SC.",
	},

	order: {
		type: Number,
		initial: true,
		required: true,
		label: "Ordre",
		note: "Défini l'ordre d'apparition sur les pages /members et /characters ainsi que le groupe principal à afficher pour chaque membre.",
	},

	color: {
		type: Types.Color,
		label: "Couleur"
	},

	rights: {
		type: Types.Relationship,
		ref: 'UserRight',
		many: true,
		label: "Droits du groupe",
	},
	
});


/**
 * Relationships
 */
UserGroup.relationship({ref: 'User', path: 'users', refPath: 'permissions.groups'});
UserGroup.relationship({ref: 'Forum', path: 'forums', refPath: 'read'});
UserGroup.relationship({ref: 'Forum', path: 'forums', refPath: 'write'});
UserGroup.relationship({ref: 'Forum', path: 'forums', refPath: 'moderation'});

/**
 * Registration
 */
UserGroup.defaultSort = 'order';
UserGroup.defaultColumns = 'name, color, order, isBN';
UserGroup.register();
