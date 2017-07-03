/**
 * Created by Syl on 19-04-17.
 */
var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Generic page Model
 * ==========
 */
var GenericPage = new keystone.List('GenericPage', {
	label: "Page générique",
	plural: "Pages générique",
	track: true,
});

GenericPage.add({

	key: {
		type: String,
		initial: true,
		required: true,
		unique: true,
		index: true,
		label: "Clé de la page",
		note: "Cette clé est utilisée dans l'URL (/content/CLE/) pour charger le contenu de la page."
	},

	name: {
		type: String,
		initial: true,
		required: true,
		label: "Titre de la page"
	},

	contenu: {
		type: Types.Html,
		wysiwyg: false,
		height: 300,
		label: "Contenu (Markdown)"
	},
	
});

/**
 * Registration
 */
GenericPage.defaultColumns = 'key, name';
GenericPage.register();
