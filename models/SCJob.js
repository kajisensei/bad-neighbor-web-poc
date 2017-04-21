/**
 * Created by Syl on 19-04-17.
 */
var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Star Citizen Job Model
 * ==========
 */
var SCJob = new keystone.List('SCJob', {
	label: "Job Star Citizen",
	plural: "Jobs Star Citizen"
});

SCJob.add({

	name: {
		type: String,
		initial: true,
		required: true,
		unique: true,
		index: true,
		label: "Nom du job"
	},

	orientation: {
		type: Types.Select, options: [
			{value: 'none', label: 'Aucun'},
			{value: 'faucheur', label: 'Faucheur'},
			{value: 'corrupteur', label: 'Corrupteur'},
		],
		default: 'none',
		label: "Orientation"
	},
	
});

/**
 * Relationships
 */
SCJob.relationship({ref: 'User', path: 'users', refPath: 'scjobs'});


/**
 * Registration
 */
SCJob.defaultColumns = 'name, orientation';
SCJob.register();
