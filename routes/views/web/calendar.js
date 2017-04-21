/**
 * Created by Syl on 21-04-17.
 */
var keystone = require('keystone');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = 'calendar';

	view.render('web/calendar');
};
