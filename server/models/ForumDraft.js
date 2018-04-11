let keystone = require('keystone');
let Types = keystone.Field.Types;

/**
 * Forum draft
 * ==========
 */
let ForumDraft = new keystone.List('ForumDraft', {
	label: "Brouillon",
	track: true
});

ForumDraft.add({

	name: {
		type: String,
		initial: true,
		required: true,
		label: "Nom du sujet"
	},

	content: {
		type: Types.Textarea,
		height: 150,
		initial: true,
		required: true,
		label: "Contenu"
	},

});

/**
 * Registration
 */
ForumDraft.defaultSort = '-createdAt';
ForumDraft.defaultColumns = 'name, content, createdAt, createdBy';
ForumDraft.register();
