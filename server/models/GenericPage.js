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

	images: {
		type: Types.CloudinaryImages,
		label: "Upload d'images",
		autoCleanup : true,
		note: "Une fois uploadée, l'image doit encore être insérée dans le texte avec une balise img.",
	},

	contenu: {
		type: Types.Html,
		wysiwyg: true,
		height: 300,
		label: "Contenu de la page"
	},
	
});

/**
 * Registration
 */
GenericPage.defaultColumns = 'key, name';
GenericPage.register();
