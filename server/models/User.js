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
	autokey: { from: 'username', path: 'key', unique: true },
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

	connectDate: {
		type: Date,
		default: Date.now,
		noedit: true,
		label: "Date de dernière visite"
	},

	readDate: {
		type: Date,
		default: Date.now,
		noedit: true,
		label: "Date de reset",
		note: "Determiné quand on utilise 'Marquer tous les forums comme lus'"
	},

	sign: {
		type: Types.Textarea,
		height: 150,
		label: "Signature forum"
	},

	posts: {
		type: Number,
		default: 0,
		noedit: true,
		label: "Compteur de posts"
	},

	medals: {
		type: Types.Relationship,
		ref: 'UserMedal',
		many: true,
		label: "Médailles",
	},

	activation_token: {
		type: String,
		index: true,
		label: "Token d'activation de compte",
	},
	
}, 'Personnel (Informations facultatives)', {

	personnal: {

		city: {
			type: String,
			label: "Pays - Ville"
		},

		birthday: {
			type: Types.Date,
			label: "Date de naissance"
		},

		discord: {
			type: String,
			label: "Handle Discord",
		},

		steam: {
			type: String,
			label: "Handle Steam",
		},

		origin: {
			type: String,
			label: "Handle Origin",
		},

		uplay: {
			type: String,
			label: "Handle Uplay",
		},

		bnet: {
			type: String,
			label: "Handle Battle.net",
		},
	}
	
}, 'Permissions', {
	
	permissions: {
		isAdmin: {
			type: Boolean,
			label: 'Administrateur',
			index: true,
			note: "Donne accès de manière inconditionnelle à cette administration.",
		},

		groups: {
			type: Types.Relationship,
			ref: 'UserGroup',
			many: true,
			label: "Groupes utilisateur",
		},

		active: {
			type: Boolean,
			label: 'Actif',
			index: true,
			note: "Ce compte a été activé et peut se connecter.",
		},

		banned: {
			type: Boolean,
			label: 'Banni',
			index: true,
			note: "Ce compte est banni et ne peut plus se connecter.",
		},
	},
	
}, 'Star Citizen', {

	starCitizen: {
		isSC: {
			type: Boolean,
			label: "Ce joueur joue à Star Citizen"
		},

		handle: {
			type: String,
			label: "Handle RSI",
			note: "Le truc qui se trouve: https://robertsspaceindustries.com/citizens/[ICI]",
		},

		character: {
			type: Types.Name,
			label: "Nom du personnage",
			dependsOn: { "starCitizen.isSC": true}
		},

		description: {
			type: Types.Textarea,
			height: 150,
			label: "Description du personnage",
			note: "Cette description sera utilisée pour le module McCoy",
			dependsOn: { "starCitizen.isSC": true}
		},

		jobs: {
			type: Types.Relationship,
			ref: 'SCJob',
			many: true,
			label: "Jobs",
			dependsOn: { "starCitizen.isSC": true}
		},

		ships: {
			type: Types.Relationship,
			ref: 'SCShip',
			many: true,
			label: "Vaisseaux",
			dependsOn: { "starCitizen.isSC": true}
		},
	}
	
});

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function () {
	return this.permissions.isAdmin;
});


/**
 * Relationships
 */
User.relationship({ref: 'ForumTopic', path: 'forumtopics', refPath: 'createdBy'});

/**
 * Registration
 */
User.defaultSort = '-createdAt';
User.defaultColumns = 'username, email, permissions.isAdmin, createdAt, permissions.groups';
User.register();
