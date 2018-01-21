/**
 * Created by Syl on 20-04-17.
 */
let keystone = require('keystone');
let Types = keystone.Field.Types;

/**
 * Forum topic tag
 * ==========
 */
let ForumTopicTag = new keystone.List('ForumTopicTag', {
	label: "Thème sujet",
	plural: "Thèmes sujet",
});

ForumTopicTag.add({

	name: {
		type: String,
		initial: true,
		required: true,
		label: "Nom du thème"
	},

	groups: {
		initial: true,
		type: Types.Relationship,
		ref: 'UserGroup',
		many: true,
		label: "Visible par",
		note: "Restreindre la visibilité des sujets associés à ce thème. Laisser vide pour laisser public.",
	},

	selectable: {
		initial: true,
		type: Types.Relationship,
		ref: 'UserGroup',
		many: true,
		label: "Associable par",
		note: "Détermine qui peut associer ce thème aux sujets. Laisser vide pour laisser utilisable par tout le monde.",
	},

});

/**
 * Registration
 */
ForumTopicTag.defaultSort = '-name';
ForumTopicTag.defaultColumns = 'name, groups, selectable';
ForumTopicTag.register();
