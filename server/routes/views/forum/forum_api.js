const keystone = require('keystone');
const ForumTopic = keystone.list('ForumTopic');
const ForumMessage = keystone.list('ForumMessage');


const API = {

	/*
	 * Module creation
	 */

	publish: (req, reqObject, res) => {

		res.send({
			error: "Prout"
		});

	}


};




exports = module.exports = (req, res) => {
	const action = req.params['action'];

	if (API[action]) {
		API[action](req, req.body, res);
	} else {
		res.err(null, "Method not found", "No method for action: " + action);
	}
};
