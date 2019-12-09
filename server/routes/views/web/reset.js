const keystone = require('keystone');
const User = keystone.list("User");
const mail = require("../../../mailin/mailin.js");
const textUtils = require("../../textUtils.js");

exports = module.exports = function (req, res) {

	const token = req.params.token;
	const locals = res.locals;
	locals.formData = req.body || {};

	const view = new keystone.View(req, res);

	view.on("get", next => {
		User.model.findOne({
			["activation_token"]: token
		}).exec((err, user) => {
			if (err) return res.err(err, err.name, err.message);

			if (!user) {
				req.flash('error', "Requête introuvable.");
				return res.redirect("/");
			} else {
				next();
			}

		});
	});

	view.on("post", {action: 'reset'}, next => {

		const password = locals.formData.password;
		const token = locals.formData.token;

	
		User.model.findOne({
			["activation_token"]: token
		}).exec((err, user) => {
			if (err) return res.err(err, err.name, err.message);

			if (!user) {
				req.flash('error', "Requête introuvable.");
				return res.redirect("/");
			} else {

				user.password = password;
				user.activation_token = null;

				user.save((err, u) => {
					if (err) {
						console.log(err.errors);
					} else {
						req.flash('success', "Mot de passe modifié.");
						
						// On envoie un mail de notification de manière async.
						mail.sendMail(user.email, user.username, "Modification du mot de passe", "password_change.pug", {
							username: user.username,
							today: locals.dateformat(new Date(), "d mmm yyyy à HH:MM"),
							ip: textUtils.getRequestIP(req) || "",
							account: process.env.BASE_URL + "/account"
						});

						return res.redirect("/");
					}
				});
				
			}

		});
		
	});

	// Render the view
	view.render('web/account_reset', {token: token});


};
