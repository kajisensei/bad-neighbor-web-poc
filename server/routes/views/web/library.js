/**
 * Created by Cossement Sylvain on 19-04-17.
 */
const keystone = require('keystone');
const GenericPage = keystone.list('GenericPage');
const GridFS = require("../../../gridfs/GridFS.js");

exports = module.exports = function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;
	const user = locals.user;

	// Check rights
	if (!locals.rightKeysSet.has('image-library')) {
		req.flash('error', "Vous n'avez pas accès à cette page.");
		return res.redirect("/");
	}

	// Load the current post
	view.on('init', function (next) {

		GridFS.findFiles({filename: {$regex: "^library-", $options: 'i'}}).then(files => {

			locals.files = files;
			next();
			
		}).catch(err => {
			res.err(err, err.name, err.message);
		});

	});

	// Render the view
	view.render('web/library');
};
