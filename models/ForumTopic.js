/**
 * Created by Syl on 20-04-17.
 */
var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Forum topic
 * ==========
 */
var ForumTopic = new keystone.List('ForumTopic', {
	label: "Sujet",
	track: true,
	autokey: {from: 'name', path: 'key', unique: false},
});

ForumTopic.add({

	name: {
		type: String,
		initial: true,
		required: true,
		unique: true,
		label: "Nom du sujet"
	},

	category: {
		initial: true,
		type: Types.Relationship,
		ref: 'ForumCategory',
		many: false,
		label: "Catégorie forum",
		note: "La catégorie n'est pas obligatoire, mais un sujet sans catégorie n'apparaitra pas dans le forum.",
	},

	flags: {

		announcement: {
			type: Boolean,
			initial: true,
			label: "Annonce",
			note: "Le sujet est une annonce et sera visible quel que soit le forum affiché.",
			dependsOn: {
				"category": null
			},
		},

		pinned: {
			type: Boolean,
			initial: true,
			label: "Épinglé",
			note: "Les sujets épinglés apparaissent toujours en premier dans les forums.",
		},

		closed: {
			type: Boolean,
			initial: true,
			label: "Verrouillé",
			note: "Le sujet est verrouillé et ne peut plus recevoir de message.",
		},
	},


});

/**
 * Registration
 */
ForumTopic.defaultSort = '-createdAt';
ForumTopic.defaultColumns = 'name, category, createdAt, createdBy, flags.announcement, flags.pinned, flags.closed';
ForumTopic.register();
