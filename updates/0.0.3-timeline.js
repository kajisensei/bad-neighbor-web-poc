/**
 * This script automatically creates a default Admin user when an
 * empty database is used for the first time. You can use this
 * technique to insert data into any List you have defined.
 *
 * Alternatively, you can export a custom function for the update:
 * module.exports = function(done) { ... }
 */

exports.create = {

	TimelineEntry: [
		{
			'name': 'Voyager Direct fondé',
			'startDate': new Date("2898-07-13"),
			summary: "Alors que Cary Lindle créait Voyager Direct, Othman Steiner voyait le jour sur Terra. Naissance de la plus grande plateforme de vente de l'UEE et de celui qui allait la détrousser."
		},
		{
			'name': 'Programme "Pupilles"',
			'startDate': new Date("2910-09-01"),
			summary: "Suite à la défaite cuisante de l'escadron 42 face aux Vanduuls, l'UEE ouvre de nouvelles sections de formation dédiées aux enfants à l'Académie Millitaire de Gen (Terra IV). Othman Steiner fait partie de ces nouvelles recrues."
		},
		{
			'name': 'Terra, le centre de l\'UEE',
			'startDate': new Date("2913-01-01"),
			summary: "Terra est déclarée nouvelle capitale culturelle de l'UEE. Steiner entre dans la dernière phase de sa formation malgrès de nombreuses mises à pied pour manque de discipline."
		},
		{
			'name': "Retour dans l'ombre",
			'startDate': new Date("2945-10-15"),
			summary: "Suite au discours de l'amiral Bishop, les BN se font plus discrets, comme s'ils se réfugiaient dans les ombres qui les ont enfanté : Spider dans le système de Cathcart."
		},
	],

};
