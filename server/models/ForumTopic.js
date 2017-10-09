/**
 * Created by Syl on 20-04-17.
 */
let keystone = require('keystone');
let Types = keystone.Field.Types;

/**
 * Forum topic
 * ==========
 */
let ForumTopic = new keystone.List('ForumTopic', {
	label: "Sujet",
	track: true,
	autokey: {from: 'name', path: 'key', unique: true},
});

ForumTopic.add({

	name: {
		type: String,
		initial: true,
		required: true,
		label: "Nom du sujet"
	},

	forum: {
		initial: true,
		type: Types.Relationship,
		ref: 'Forum',
		many: false,
		label: "Forum",
		index: true,
		note: "Le forum n'est pas obligatoire, mais un sujet sans forum n'apparaitra pas dans les listes. Typiquement utilisé pour les annonces.",
	},

	tags: {
		initial: true,
		type: Types.Relationship,
		ref: 'ForumTopicTag',
		many: true,
		label: "Marqueur",
		index: true
	},

	flags: {

		announcement: {
			type: Boolean,
			initial: true,
			label: "Annonce",
			note: "Le sujet est une annonce et sera visible quel que soit le forum affiché.",
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

	views: {
		initial: true,
		type: Types.Relationship,
		ref: 'User',
		many: true,
		noedit: true,
		label: "Vu par",
		note: "Indique par qui a été vu le sujet depuis son dernier message. Sert en interne pour l'affichage des marqueurs de 'messages non lus'.",
	},
	
}, "Statistiques", {
	
	stats: {
		replies: {
			type: Number,
			default: 0,
			noedit: true,
			label: "Nombre de réponses"
		},

		views: {
			type: Number,
			default: 0,
			noedit: true,
			label: "Nombre de vues"
		},
	},

	first: {
		type: Types.Relationship,
		ref: 'ForumMessage',
		many: false,
		noedit: true,
		label: "Premier message",
		note: "Redondance pour optimisation",
	},

	last: {
		type: Types.Relationship,
		ref: 'ForumMessage',
		many: false,
		noedit: true,
		label: "Dernier message",
		note: "Redondance pour optimisation",
	},
	
}, "Publication sur l'accueil", {

	publish: {

		date: {
			type: Date,
			label: "Date de publication",
			note: "Détermine si le message est posté sur la page d'accueil, et si oui, à quelle date."
		},

		title: {
			type: String,
			label: "Titre",
		},

		type: {
			type: String,
			label: "Type",
		},

		category: {
			type: String,
			label: "Catégorie",
		},

		animated: {
			type: Boolean,
			label: "Animé",
			note: "Détermine si une image animée a été associée lors de la publication"
		},
	},
	
}, "Sélection 'En direct du forum'", {
	
	selection: {

		date: {
			type: Date,
			label: "Date de sélection",
			note: "Détermine si le message est posté sur la page d'accueil, et si oui, à quelle date."
		},
		
		category: {
			type: String,
			label: "Catégorie",
		},
		
	}

});

ForumTopic.relationship({ path: 'forumtopics', ref: 'ForumMessage', refPath: 'topic' });

/**
 * Registration
 */
ForumTopic.defaultSort = '-createdAt';
ForumTopic.defaultColumns = 'name, forum, createdAt, createdBy, flags.announcement, flags.pinned, flags.closed';
ForumTopic.register();
