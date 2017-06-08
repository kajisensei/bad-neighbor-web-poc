/**
 * This script automatically creates a default Admin user when an
 * empty database is used for the first time. You can use this
 * technique to insert data into any List you have defined.
 *
 * Alternatively, you can export a custom function for the update:
 * module.exports = function(done) { ... }
 */

exports.create = {
	
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

	SCShip: [
		{'name': "RSI: Aurora ES"},
		{'name': "RSI: Aurora MR"},
		{'name': "RSI: Aurora CL"},
		{'name': "RSI: Aurora LX"},
		{'name': "RSI: Aurora LN"},
		{'name': "RSI: Constellation Andromeda"},
		{'name': "RSI: Constellation Taurus"},
		{'name': "RSI: Constellation Aquila"},
		{'name': "RSI: Constellation Phoenix"},
		{'name': "RSI: Orion"},
		{'name': "RSI: Polaris"},

		{'name': "Origin: 300i"},
		{'name': "Origin: 315p"},
		{'name': "Origin: 325a"},
		{'name': "Origin: 350r"},
		{'name': "Origin: 890 Jump"},
		{'name': "Origin: M50"},
		{'name': "Origin: 85X"},

		{'name': "Aegis: Avenger Stalker"},
		{'name': "Aegis: Avenger Warlock"},
		{'name': "Aegis: Avenger Titan"},
		{'name': "Aegis: Gladius"},
		{'name': "Aegis: Idris-P"},
		{'name': "Aegis: Idris-M"},
		{'name': "Aegis: Javelin"},
		{'name': "Aegis: Reclaimer"},
		{'name': "Aegis: Redeemer"},
		{'name': "Aegis: Retaliator"},
		{'name': "Aegis: Sabre"},
		{'name': "Aegis: Terrapin"},
		{'name': "Aegis: Vanguard Warden"},
		{'name': "Aegis: Vanguard Sentinel"},
		{'name': "Aegis: Vanguard Harbinger"},

		{'name': "Drake: Cutlass Black"},
		{'name': "Drake: Cutlass Red"},
		{'name': "Drake: Cutlass Blue"},
		{'name': "Drake: Caterpillar"},
		{'name': "Drake: Dragonfly"},
		{'name': "Drake: Herald"},
		{'name': "Drake: Buccaneer"},

		{'name': "Anvil: Carrack"},
		{'name': "Anvil: Crucible"},
		{'name': "Anvil: Gladiator"},
		{'name': "Anvil: Hurricane"},
		{'name': "Anvil: F7A Hornet"},
		{'name': "Anvil: F7C Hornet"},
		{'name': "Anvil: F7C-M Super Hornet"},
		{'name': "Anvil: F7C-R Hornet Tracker"},
		{'name': "Anvil: F7C-S Hornet Ghost"},

		{'name': "MISC: Endeavor"},
		{'name': "MISC: Freelancer"},
		{'name': "MISC: Freelancer DUR"},
		{'name': "MISC: Freelancer MIS"},
		{'name': "MISC: Freelancer MAX"},

		{'name': "MISC: Hull A"},
		{'name': "MISC: Hull B"},
		{'name': "MISC: Hull C"},
		{'name': "MISC: Hull D"},
		{'name': "MISC: Hull E"},
		{'name': "MISC: Razor"},
		{'name': "MISC: Reliant Kore"},
		{'name': "MISC: Reliant Sen"},
		{'name': "MISC: Reliant Mako"},
		{'name': "MISC: Reliant Tana"},
		{'name': "MISC: Starfarer"},
		{'name': "MISC: Starfarer Gemini"},
		{'name': "MISC: Prospector"},

		{'name': "Kruger: P-52 Merlin"},
		{'name': "Kruger: P-72 Archimedes"},

		{'name': "CNOU: Mustang Alpha"},
		{'name': "CNOU: Mustang Beta"},
		{'name': "CNOU: Mustang Delta"},
		{'name': "CNOU: Mustang Gamma"},
		{'name': "CNOU: Mustang Omega"},

		{'name': "Crusader: Genesis Starliner"},

		{'name': "Esperia: Scythe"},
		{'name': "Esperia: Glaive"},
		{'name': "Esperia: Blade"},
		{'name': "Esperia: Prowler"},

		{'name': "Banu: Merchantman"},
		{'name': "Banu: Defender"},

		{'name': "Xi'An: Khartu-al"},

		{'name': "MPUV Personnel"},
		{'name': "MPUV Cargo"},
	],

	/*
		Some defaults for forum to mirror current phpBB
	 */
	
	Forum: [
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
