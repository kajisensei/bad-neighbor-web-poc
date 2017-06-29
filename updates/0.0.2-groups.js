/**
 * This script automatically creates a default Admin user when an
 * empty database is used for the first time. You can use this
 * technique to insert data into any List you have defined.
 *
 * Alternatively, you can export a custom function for the update:
 * module.exports = function(done) { ... }
 */

exports.create = {

	UserRight: [
		{ 'name': 'Forum - Articles', 'description': "L'utilisateur peut sélectionner des sujets et en faire des articles." },
		{ 'name': 'Forum - En direct', 'description': "L'utilisateur peut sélectionner des sujets et les ajouter à la sélection accueil 'En direct du forum'." },
	],
	
};
