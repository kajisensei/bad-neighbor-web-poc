/**
 * Created by Syl on 20-04-17.
 */
let keystone = require('keystone');
let Types = keystone.Field.Types;

/**
 * Forum message
 * ==========
 */
let ForumMessage = new keystone.List('ForumMessage', {
	label: "Message",
	track: true,
});

ForumMessage.add({

	content: {
		type: Types.Textarea,
		height: 150,
		initial: true,
		required: true,
		label: "Contenu"
	},

	topic: {
		initial: true,
		type: Types.Relationship,
		required: true,
		index: true,
		ref: 'ForumTopic',
		many: false,
		label: "Sujet",
	},

	author: {
		type: String,
		initial: true,
		required: true,
		noedit: true,
		label: "Auteur",
		note: "Une copie du nom de l'auteur, utilisé en cas de suppression future de l'utilisateur."
	},

	author_ip: {
		type: String,
		label: "Adressse IP postante",
	},

});

/**
 * Registration
 */
ForumMessage.defaultSort = '-createdAt';
ForumMessage.defaultColumns = 'topic, content, createdAt, createdBy, author_ip';
ForumMessage.register();
