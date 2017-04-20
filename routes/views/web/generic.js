/**
 * Created by Cossement Sylvain on 19-04-17.
 */
var keystone = require('keystone'), GenericPage = keystone.list('GenericPage');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = req.params["contentKey"];

	// Load the current post
	view.on('init', function (next) {

		var q = GenericPage.model.findOne().where('key', locals.section);

		q.exec(function (err, result) {
			locals.data = result;
			next(err);
		});

	});

	// Render the view
	view.render('web/generic');
};
