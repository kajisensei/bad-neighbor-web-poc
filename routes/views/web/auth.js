const keystone = require('keystone');
const User = keystone.list('User');

exports = module.exports = function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	// Toujours associer une section pour correctement colorer le menu.
	locals.section = 'auth';
	locals.from = req.query.from;

	if (req.user) {
		req.flash('success', "Vous êtes authentifié.");
		if (locals.from) {
			res.redirect(locals.from);
		} else {
			res.redirect('/');
		}
		return;
	}

	locals.formData = req.body || {};

	view.on('post', {action: 'auth'}, next => {
		let isOk = true;
		if (!locals.formData.email) {
			req.flash('error', "Veuillez entrer votre adresse email.");
			isOk = false;
		}
		if (!locals.formData.password) {
			req.flash('error', "Veuillez entrer un mot de passe.");
			isOk = false;
		}
		if (isOk) {

			keystone.session.signin({email: locals.formData.email, password: locals.formData.password}, req, res,
				user => {

					if (locals.from) {
						res.redirect(locals.from);
					} else {
						res.redirect('/');
					}

				}, err => {

					req.flash('error', "Adresse email ou mot de passe invalide.");
					next();

				});
		}


	});

	// Render the view
	view.render('web/auth');
};
