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
		label: "Droit de lecture",
		note: "Ces groupes peuvent voir ce forum. ATTENTION: si laissé vide, alors le forum est public.",
	},
	
	write: {
		type: Types.Relationship,
		ref: 'UserGroup',
		many: true,
		label: "Droit de création",
		note: "Ces groupes peuvent créer des sujets dans ce forum.",
	},

	["write-post"]: {
		type: Types.Relationship,
		ref: 'UserGroup',
		many: true,
		label: "Droit de réponse",
		note: "Ces groupes peuvent répondre aux sujets dans ce forum.",
	},
	
	moderation: {
		type: Types.Relationship,
		ref: 'UserGroup',
		many: true,
		label: "Droit de modération",
		note: "Ces groupes on un droit de modération dans ce forum: Suppression/edition de messages, sélection articles.",
	},

	tags: {
		initial: true,
		type: Types.Relationship,
		ref: 'ForumTopicTag',
		many: true,
		label: "Marqueurs disponibles",
	},

});

Forum.relationship({ path: 'forums', ref: 'ForumTopic', refPath: 'forum' });

/**
 * Registration
 */
Forum.defaultSort = 'order';
Forum.defaultColumns = 'name, description, group, order';
Forum.register();

