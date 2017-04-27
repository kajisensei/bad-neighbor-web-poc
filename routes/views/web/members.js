const keystone = require('keystone');
const User = keystone.list('User');

exports = module.exports = function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;
	
	locals.section = 'members';
	
	// On chope les groupes BN

	// Render the view
	view.render('web/index');
};
