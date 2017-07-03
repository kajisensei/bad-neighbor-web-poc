/*
 Formulaire de recrutement
 */

const keystone = require('keystone');
const Promise = require("bluebird");
const ForumTopic = keystone.list('ForumTopic');
const ForumMessage = keystone.list('ForumMessage');
const GenericPage = keystone.list('GenericPage');
const showdown = require('showdown'),
	xss = require('xss'),
	converter = new showdown.Converter();

exports = module.exports = (req, res) => {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	locals.section = 'recrutement';

	view.on('init', (next) => {
		// choper les textes
		const queries = [];

		// Premier texte recrutement "Qui sont les BN en vrai?"
		queries.push(GenericPage.model.findOne({
				"key": "recrutement-qui"
			})
				.exec()
				.then((text) => {
					if (text)
						locals.text1 = xss(converter.makeHtml(text.contenu));
				})
		);

		// Deuxième texte recrutement "Règlement"
		queries.push(GenericPage.model.findOne({
				"key": "recrutement-reglement"
			})
				.exec()
				.then((text) => {
					if (text)
						locals.text2 = xss(converter.makeHtml(text.contenu));
				})
		);

		Promise.all(queries).then(() => {
			next();
		}).catch(err => {
			console.log(err);
			res.err(err, err.name, err.message);
		});
	});

	// Render the view
	view.render('forum/recrutement');
};
