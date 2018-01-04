const keystone = require('keystone');
const User = keystone.list('User');

// On auth
keystone.post("signin", function (next) {
	// Save auth date
	User.model.update({_id: this.id}, {connectDate: new Date()}, (err) => {
		if(err)
			console.log(err);
		next();
	});

});

exports = module.exports = function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	// Toujours associer une section pour correctement colorer le menu.
	locals.section = 'auth';
	locals.from = req.query.from;
	locals.formData = req.body || {};

	// Signout handler
	view.on("init", next => {
		if (req.params.unauth === "signout") {
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
		if (!locals.formData["g-recaptcha-response"]) {
			req.flash('error', "Merci de vérifier que t'es pas un sale bot.");
			isOk = false;
		}
		
		if (isOk) {
			
			// Check si actif et pas banni
			User.model.findOne({
				email: locals.formData.email
			}).select("permissions").exec((err, user) => {
				if (err) return res.err(err, err.name, err.message);

				if(!user) {
					req.flash('error', "Adresse email ou mot de passe invalide.");
					return next();
				}
				
				if(!user.permissions.active) {
					req.flash('error', "Ce compte n'est pas actif. Vérifiez le mail reçu à votre inscription.");
					return next();
				}

				if(user.permissions.banned) {
					req.flash('error', "Ce compte est banni. Vous avez du énerver le chef.");
					return next();
				}

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
			});
			
		} else {
			return next();
		}


	});

	// Render the view
	view.render('web/auth');
};
