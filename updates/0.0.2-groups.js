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
		{ 'name': 'SC-Leader', 'color': '#330000', 'isBN': true, 'order': 1 },
		{ 'name': 'SC-Officier', 'color': '#330000', 'isBN': true, 'order': 2 },
		{ 'name': 'SC-Faucheur', 'color': '#313131', 'isBN': true, 'order': 3 },
		{ 'name': 'SC-Corrupteur', 'color': '#313131', 'isBN': true, 'order': 4 },
		{ 'name': 'BN original', 'color': '#CC0000', 'isBN': true, 'order': 5 },
		{ 'name': 'SC-Recrue', 'color': '#CC0000', 'isBN': true, 'order': 6 },
		
		{ 'name': 'Enregistré', 'color': '#006666', 'order': 99 },
	],

	UserRight: [
		{ 'name': 'Calendar - Access', 'description': "L'utilisateur a accès au calendrier." },
		{ 'name': 'Calendar - Nouveau', 'description': "L'utilisateur peut créer des évènements au calendrier." },
		{ 'name': 'Article - Nouvel article', 'description': "L'utilisateur peut suggérer des articles." },
		{ 'name': 'Article - Publication', 'description': "L'utilisateur peut publier des articles." },
	],
};
