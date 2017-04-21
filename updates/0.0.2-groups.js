/**
 * This script automatically creates a default Admin user when an
 * empty database is used for the first time. You can use this
 * technique to insert data into any List you have defined.
 *
 * Alternatively, you can export a custom function for the update:
 * module.exports = function(done) { ... }
 */

exports.create = {
	
	UserGroup: [
		{ 'name': 'Enregistré', 'color': '#006666' },
		{ 'name': 'SC-Recrue', 'color': '#CC0000' },
		{ 'name': 'BN original', 'color': '#CC0000' },
		{ 'name': 'SC-Faucheur', 'color': '#313131' },
		{ 'name': 'SC-Corrupteur', 'color': '#313131' },
		{ 'name': 'SC-Officier', 'color': '#330000' },
		{ 'name': 'SC-Leader', 'color': '#330000' },
	],

	UserRight: [
		{ 'name': 'Calendar - Access', 'description': "L'utilisateur a accès au calendrier." },
		{ 'name': 'Calendar - Nouveau', 'description': "L'utilisateur peut créer des évènements au calendrier." },
		{ 'name': 'Forum - Access', 'description': "L'utilisateur a accès au forum." },
		{ 'name': 'Forum - Nouveau sujet', 'description': "L'utilisateur peut créer des nouveaux sujets." },
		{ 'name': 'Forum - Répondre à un sujet', 'description': "L'utilisateur peut répondre aux sujets." },
	],
};
