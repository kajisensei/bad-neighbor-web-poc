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
	label: "Sujet forum",
	track: true,
	autokey: { from: 'name', path: 'key', unique: false },
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

});

/**
 * Registration
 */
ForumTopic.defaultSort = '-createdAt';
ForumTopic.defaultColumns = 'name, author, createdAt, createdBy';
ForumTopic.register();
