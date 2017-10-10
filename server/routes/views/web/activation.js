const keystone = require('keystone');
const User = keystone.list("User");

exports = module.exports = function (req, res) {

	const token = req.params.token;

	User.model.findOneAndUpdate({
		["activation_token"]: token
	}, {
		["permissions.active"]: true,
		["activation_token"]: null
	}, (err, user) => {
		if (err) return res.err(err, err.name, err.message);

		if(!user) {
			req.flash('error', "Aucun utilisateur trouvé associé à cette activation.");
			return res.redirect("/");
		} else {
			keystone.session.signin(user._id, req, res,
				user => {
					req.flash('success', "Votre compte est maintenant actif. Bienvenue !");
					return res.redirect("/");
				}, err => {
					return res.redirect("/");
				});
		}

	});
	
};
