const keystone = require('keystone');
const User = keystone.list('User');
const GenericPage = keystone.list('GenericPage');
const textUtils = require("../../textUtils");

exports = module.exports = (req, res) => {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	// Charger le texte
	view.on('init', (next) => {
		GenericPage.model.findOne({
			"key": "mccoy"
		})
			.exec((err, text) => {
				if (err) return res.err(err, err.name, err.message);
				
				if (text)
					locals.content = text;
					text.contenu = textUtils.markdownize(text.contenu);

				next();
			});
	});

	// Render the view
	view.render('web/mccoy');
};
