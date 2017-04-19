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
		{ 'username': 'Kaji', 'email': 'kaji@bn.fr', 'password': 'bar', 'isAdmin': true },
		{ 'username': 'Fistounet', 'email': 'fistou@bn.fr', 'password': 'bar', 'isAdmin': true },
		{ 'username': 'Roken', 'email': 'roken@bn.fr', 'password': 'bar', 'isAdmin': true },
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
	]
};
