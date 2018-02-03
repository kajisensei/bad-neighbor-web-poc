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
	const search = req.query["search"];
	const page = Number(req.query["page"]) || 1;

	// Check rights
	if (!locals.rightKeysSet.has('image-library')) {
		req.flash('error', "Vous n'avez pas accès à cette page.");
		return res.redirect("/");
	}

	// Search
	view.on('init', function (next) {
		
		locals.search = search;
		locals.page = page;

		GridFS.findFiles({filename: {$regex: search || "", $options: 'i'}}, search ? null : page).then(files => {

			locals.files = files;
			next();
			
		}).catch(err => {
			res.err(err, err.name, err.message);
		});

	});

	// Count
	view.on('init', function (next) {

		GridFS.count({filename: {$regex: search || "", $options: 'i'}}).then(count => {

			locals.totalPages = Math.ceil(count / 16);
			next();

		}).catch(err => {
			res.err(err, err.name, err.message);
		});

	});

	// Render the view
	view.render('web/library');
};
