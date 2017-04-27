/**
 * Created by Syl on 19-04-17.
 */
const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Star Citizen Job Model
 * ==========
 */
const SCShip = new keystone.List('SCShip', {
	label: "Vaisseau Star Citizen",
	plural: "Vaisseaux Star Citizen"
});

SCShip.add({

	name: {
		type: String,
		initial: true,
		required: true,
		unique: true,
		index: true,
		label: "Nom du vaisseau"
	},
	
});

/**
 * Relationships
 */
SCShip.relationship({ref: 'User', path: 'users', refPath: 'starCitizen.ships'});


/**
 * Registration
 */
SCShip.defaultColumns = 'name, orientation';
SCShip.register();
