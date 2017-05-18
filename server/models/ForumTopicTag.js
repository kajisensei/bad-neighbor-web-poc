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
	label: "Marqeur sujet",
	plural: "Marqueurs sujet",
});

ForumTopicTag.add({

	name: {
		type: String,
		initial: true,
		required: true,
		label: "Nom du marqueur"
	},

	groups: {
		initial: true,
		type: Types.Relationship,
		ref: 'UserGroup',
		many: true,
		label: "Groupes utilisateur",
		note: "Restreindre la visibilité des topics associé à ce marqueur. Laisser vide pour laisser public.",
	},

});

/**
 * Registration
 */
ForumTopicTag.defaultSort = '-name';
ForumTopicTag.defaultColumns = 'name, groups';
ForumTopicTag.register();
