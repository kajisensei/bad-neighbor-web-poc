/**
 * Created by Cossement Sylvain on 19-04-17.
 */
var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Forum
 * ==========
 */
var Forum = new keystone.List('Forum', {
	label: "Forum",
	autokey: { from: 'name', path: 'key', unique: true },
});

Forum.add({

	name: {
		type: String,
		initial: true,
		required: true,
		label: "Nom du forum"
	},

	group: {
		type: String,
		initial: true,
		required: true,
		label: "Groupe",
		note: "Le groupe auquel appartient le forum. Par exemple Star Citizen, ou Communuaté ou Archive."
	},

	order: {
		type: Number,
		initial: true,
		required: true,
		unique: true,
		label: "Numéro d'ordre",
		note: "Les forums seront affichés par ordre de numéro croissant."
	},

	description: {
		type: String,
		label: "Description du forum",
		initial: true,
	},
	
	read: {
		type: Types.Relationship,
		ref: 'UserGroup',
		many: true,
		label: "Accès en lecture",
	},
	
	write: {
		type: Types.Relationship,
		ref: 'UserGroup',
		many: true,
		label: "Accès en écriture",
	},
	
	moderation: {
		type: Types.Relationship,
		ref: 'UserGroup',
		many: true,
		label: "Groupes modérateurs",
	}

});

Forum.relationship({ path: 'forums', ref: 'ForumTopic', refPath: 'forum' });

/**
 * Registration
 */
Forum.defaultSort = 'order';
Forum.defaultColumns = 'name, description, group, order';
Forum.register();

