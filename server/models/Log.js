const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * User Medal Model
 * ==========
 */
const LogModel = new keystone.List('Log', {
	label: "Journal d'activité",
	noedit: true,
	nocreate: true,
});

LogModel.add({
	
	level: {
		type: String,
		label: "Niveau"
	},

	timestamp: {
		type: Types.Datetime,
		label: "Date"
	},

	message: {
		type: String,
		label: "Message"
	},
	
});

/**
 * Registration
 */
LogModel.defaultSort = 'timestamp';
LogModel.defaultColumns = 'timestamp, message';
LogModel.register();
