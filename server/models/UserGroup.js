const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * User Group Model
 * ==========
 */
const UserGroup = new keystone.List('UserGroup', {
	label: "Groupe utilisateur",
	plural: "Groupes utilisateur",
	autokey: { from: 'name', path: 'key', unique: true }
});

UserGroup.add({
	
	name: {
		type: String,
		initial: true,
		required: true,
		label: "Nom du groupe"
	},

	isBN: {
		type: Boolean,
		initial: true,
		label: "Groupe BN",
		note: "Les groupes BN seront listés sur les pages /members et /characters. Sur la page d'un membre et sur ses messages forum, seul le plus haut groupe BN sera affiché.",
	},

	order: {
		type: Number,
		initial: true,
		label: "Ordre",
		note: "Défini l'ordre d'apparition des groupes sur les pages /members et /characters ainsi que le groupe principal à afficher pour chaque membre (pour la couleur).",
	},

	color: {
		type: Types.Color,
		label: "Couleur"
	},
	
}, 'Droits', {	
	
	rights: {

		["generic-content"]: {
			type: Boolean,
			label: "Contenu générique - admin",
			note: "Peut créer/modifier/supprimer des pages génériques sur le site (présentation, charte, la flotte ...etc). Peut aussi changer l'ID de la \"vidéo du moment\" sur la home.",
		},

		["image-library"]: {
			type: Boolean,
			label: "Librairie d'images - admin",
			note: "Peut uploader/modifier/supprimer des images de la librairie d'images du site.",
		},

		["calendar"]: {
			type: Boolean,
			label: "Calendrier",
			note: "Peut créer des événements au calendrier, annuler/modifier ses événements et inviter des utilisateurs à ses événements.",
		},

		["calendar-admin"]: {
			type: Boolean,
			label: "Calendrier - Admin",
			note: "Peut annuler/modifier et inviter des utilisateurs pour tous les événements. Peut convertir un événement en entrée de ligne du temps.",
		},
		
	}
	
});


/**
 * Relationships
 */
UserGroup.relationship({ref: 'User', path: 'users', refPath: 'permissions.groups'});
UserGroup.relationship({ref: 'Forum', path: 'forums', refPath: 'read'});
UserGroup.relationship({ref: 'Forum', path: 'forums', refPath: 'write'});
UserGroup.relationship({ref: 'Forum', path: 'forums', refPath: 'moderation'});
UserGroup.relationship({ref: 'ForumTopicTag', path: 'forumtopictags', refPath: 'groups'});

/**
 * Registration
 */
UserGroup.defaultSort = 'order';
UserGroup.defaultColumns = 'name, color, order, isBN';
UserGroup.register();
