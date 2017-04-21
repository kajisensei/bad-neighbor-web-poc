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

/**
 * Registration
 */
UserGroup.defaultColumns = 'name, color';
UserGroup.register();
