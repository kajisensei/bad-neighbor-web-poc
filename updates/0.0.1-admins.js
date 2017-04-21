/**
 * This script automatically creates a default Admin user when an
 * empty database is used for the first time. You can use this
 * technique to insert data into any List you have defined.
 *
 * Alternatively, you can export a custom function for the update:
 * module.exports = function(done) { ... }
 */

exports.create = {
	
	User: [
		{ 'username': 'Kaji', 'email': 'kaji@bn.fr', 'password': 'bar', 'permissions.isAdmin': true },
		{ 'username': 'Fistounet', 'email': 'fistou@bn.fr', 'password': 'bar', 'permissions.isAdmin': true },
		{ 'username': 'Roken', 'email': 'roken@bn.fr', 'password': 'bar', 'permissions.isAdmin': true },
	],
	
	SCJob: [
		{'name': "Minage", 'orientation': "corrupteur"},
		{'name': "Éclaireur", 'orientation': "faucheur"},
		{'name': "Combat", 'orientation': "faucheur"},
		{'name': "Récupération", 'orientation': "corrupteur"},
		{'name': "Course", 'orientation': "faucheur"},
		{'name': "Espionnage", 'orientation': "none"},
		{'name': "Infanterie", 'orientation': "faucheur"},
		{'name': "Commerce", 'orientation': "corrupteur"},
		{'name': "Exploration", 'orientation': "faucheur"},
		{'name': "Sciences", 'orientation': "corrupteur"},
		{'name': "Contrebande", 'orientation': "corrupteur"},
		{'name': "Transport", 'orientation': "corrupteur"},
	],

	/*
		Some defaults for forum to mirror current phpBB
	 */
	
	ForumCategory: [
		{'name': "Articles", 'group': "Contenu site", 'order': -1, 'description': "Réagir aux articles postés sur le site."},
		
		{'name': "Discussions générales", 'group': "Communauté", 'order': 1, 'description': "De tout et de rien nous parlons."},
		{'name': "Carré BAD V.I.P", 'group': "Communauté", 'order': 2, 'description': "Accès réservé aux BN d'hier et d'aujourd'hui."},
		{'name': "Jeux divers", 'group': "Communauté", 'order': 3, 'description': "A éclater"},
		{'name': "BN Hebdo", 'group': "Communauté", 'order': 4, 'description': "Ouvert à tous ceux qui désirent participer à l'animation du site BN. Boîte à outil pour les projets communautaires."},

		{'name': "Bar", 'group': "Star Citizen", 'order': 5, 'description': "Discussions générales à propos de SC."},
		{'name': "Base secrète", 'group': "Star Citizen", 'order': 6, 'description': "Partie privée. "},
	],

	/*
	 	Some defaults for calendar
	 */
	
	CalendarEntry: [
		{text: "Entrainement Faucheurs", startDate: new Date(), endDate: new Date(), public: true}
	]
};
