const keystone = require('keystone');
const User = keystone.list('User');

exports = module.exports = (req, res) => {

	const view = new keystone.View(req, res);
	
	// Render the view
	view.render('web/version');
};
