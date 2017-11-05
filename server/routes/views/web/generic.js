/**
 * Created by Cossement Sylvain on 19-04-17.
 */
const keystone = require('keystone');
const GenericPage = keystone.list('GenericPage');
const textUtils = require("../../textUtils.js");

exports = module.exports = function (req, res) {

	let view = new keystone.View(req, res);
	let locals = res.locals;

	// Set locals
	locals.section = req.params["contentKey"];

	// Load the current post
	view.on('init', function (next) {

		let q = GenericPage.model.findOne().where('key', locals.section);

		q.exec(function (err, result) {
			if (err) {
				res.err(err, err.name, err.message);
				return;
			}

			// Render markdown
			locals.data_json = JSON.stringify(result || {});
			
			if (result && result.contenu) {
				result.contenu = textUtils.markdownize(result.contenu);
			}

			locals.data = result;
			next();
		});

	});

	// Render the view
	view.render('web/generic');
};
