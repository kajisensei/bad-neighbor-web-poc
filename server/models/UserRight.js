var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * User Right Model
 * ==========
 */
var UserRight = new keystone.List('UserRight', {
	label: "Droit utilisateur",
	plural: "Droits utilisateur",
	// nocreate: true,
	nodelete: true,
	noedit: true,
	autokey: { from: 'name', path: 'key', unique: true }
});

UserRight.add({
	
	name: {
		type: String,
		initial: true,
		required: true,
		label: "Droit"
	},

	description: {
		type: String,
		label: "Description"
	},

	key: {
		type: String,
		noedit: true,
	},
	
});


/**
 * Relationships
 */
UserRight.relationship({ref: 'UserGroup', path: 'usergroups', refPath: 'rights'});
UserRight.relationship({ref: 'User', path: 'users', refPath: 'permissions.rights'});

/**
 * Registration
 */
UserRight.defaultSort = 'key';
UserRight.defaultColumns = 'key, name, description';
UserRight.register();
