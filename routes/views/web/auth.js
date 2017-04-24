var keystone = require('keystone');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Toujours associer une section pour correctement colorer le menu.
	locals.section = 'auth';

	// Render the view
	view.render('web/auth');
};
