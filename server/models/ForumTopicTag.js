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
		label: "Groupes utilisateur",
		note: "Restreindre la visibilité des topics associé à ce thème. Laisser vide pour laisser public.",
	},

});

/**
 * Registration
 */
ForumTopicTag.defaultSort = '-name';
ForumTopicTag.defaultColumns = 'name, groups';
ForumTopicTag.register();
