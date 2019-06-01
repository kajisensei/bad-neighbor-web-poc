/**
 * Created by Syl on 19-04-17.
 */
const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Generic page Model
 * ==========
 */
const GenericPage = new keystone.List('ForumTopicTemplate', {
	label: "Template de sujet forum",
	plural: "Templates de sujet forum",
	autokey: {from: 'name', path: 'key', unique: true},
});

GenericPage.add({

	name: {
		type: String,
		initial: true,
		required: true,
		label: "Nom du template"
	},

	contenu: {
		type: Types.Textarea,
		height: 300,
		label: "Contenu du template (Markdown)"
	},

});

/**
 * Registration
 */
GenericPage.defaultColumns = 'name';
GenericPage.register();
