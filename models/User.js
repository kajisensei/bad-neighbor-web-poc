var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */
var User = new keystone.List('User', {
	label: "Utilisateur",
	map: {
		name: "username",
	},
});

User.add({
	
	username: {
		type: String,
		initial: true,
		required: true,
		unique: true,
		index: true,
		label: "Nom d'utilisateur"
	},
	
	email: {
		type: Types.Email,
		initial: true,
		required: true,
		unique: true,
		index: true,
		label: "Email"
	},
	
	password: {
		type: Types.Password,
		initial: true,
		required: true,
		label: "Mot de passe"
	},
	
	createdAt: {
		type: Date,
		default: Date.now,
		noedit: true,
		label: "Date d'ajout"
	},
}, 'Personnel (Informations facultatives)', {

	name: {
		type: Types.Name,
		label: "Nom réel"
	},

	city: {
		type: String,
		label: "Pays - Ville"
	},

	birthday: {
		type: Types.Date,
		label: "Date de naissance"
	},
	
}, 'Permissions', {
	
	isAdmin: {
		type: Boolean,
		label: 'Administrateur',
		index: true
	},
	
}, 'Star Citizen', {
	
	character: {
		type: Types.Name,
		label: "Nom du personnage"
	},

	description: {
		type: Types.Html,
		wysiwyg: true,
		label: "Description du personnage",
		note: "Cette description sera utilisée pour le module McCoy"
	},
	
	role: {
		type: Types.Select, options: [
			{value: 'none', label: 'Aucun'},
			{value: 'faucheur', label: 'Faucheur'},
			{value: 'corrupteur', label: 'Corrupteur'},
		],
		default: 'none',
		index: true,
		label: "Rôle"
	},
	
	jobs: {
		type: Types.Relationship,
		ref: 'SCJob', 
		many: true,
		label: "Jobs"
	},
	
});

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function () {
	return this.isAdmin;
});


/**
 * Relationships
 */
User.relationship({ref: 'Post', path: 'posts', refPath: 'author'});


/**
 * Registration
 */
User.defaultSort = '-createdAt';
User.defaultColumns = 'username, email, role, isAdmin, createdAt';
User.register();
