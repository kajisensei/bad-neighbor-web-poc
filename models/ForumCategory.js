/**
 * Created by Cossement Sylvain on 19-04-17.
 */
var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Forum categorie
 * ==========
 */
var ForumCategory = new keystone.List('ForumCategory', {
	label: "Catégorie forum",
	autokey: { from: 'name', path: 'key', unique: true },
});

ForumCategory.add({

	name: {
		type: String,
		initial: true,
		required: true,
		unique: true,
		label: "Nom de la catégorie"
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
		note: "Les catégories seront affichées par ordre de numéro croissant."
	},

	description: {
		type: String,
		label: "Description de la catégorie",
		initial: true,
	},

});

ForumCategory.relationship({ path: 'forumscategories', ref: 'ForumTopic', refPath: 'category' });

/**
 * Registration
 */
ForumCategory.defaultSort = 'order';
ForumCategory.defaultColumns = 'name, description, group, order';
ForumCategory.register();

