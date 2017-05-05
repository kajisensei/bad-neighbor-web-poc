const keystone = require('keystone');
const User = keystone.list('User');

exports = module.exports = function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	// Toujours associer une section pour correctement colorer le menu.
	locals.section = 'auth';
	locals.from = req.query.from;
	locals.formData = req.body || {};
	
	// Signout handler
	view.on("init", next => {
		if(req.params.unauth === "signout") {
			keystone.session.signout(req, res, next);
		} else {
			next();
		}
	});
	
	// Check if we are already auth
	view.on("init", next => {
		if (req.user) {
			if (locals.from) {
				res.redirect(locals.from);
			} else {
				res.redirect('/');
			}
		}
		next();
	});
	
	// Form action for signin
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

					req.flash('info', `Bienvenue, ${user.username} !`);
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
