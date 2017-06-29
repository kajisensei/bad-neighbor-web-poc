const keystone = require('keystone');
const User = keystone.list("User");
const UserGroup = keystone.list("UserGroup");

exports = module.exports = function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;
	
	

	// Render the view
	view.render('web/account');
};
