/**
 * This file contains the common middleware used by your routes.
 *
 * Extend or replace these functions as your application requires.
 *
 * This structure is not enforced, and just a starting point. If
 * you have more middleware you may want to group it as separate
 * modules in your project's /lib directory.
 */
let _ = require('lodash');
let dateFormat = require('dateformat');

/**
 Initialises the standard view locals

 The included layout depends on the navLinks array to generate
 the navigation in the header, you may wish to change this array
 or replace it with your own templates / logic.
 */
exports.initLocals = function (req, res, next) {
	res.locals.navLinks = [
		{label: 'Accueil', key: 'home', href: '/'},
		{label: 'Articles', key: 'blog', href: '/articles'},
		{
			label: 'Le clan',
			subs: [
				{label: 'Présentation', href: '/content/presentation'},
				{label: 'Charte', href: '/content/charte'},
				{label: 'Recrutement', href: '/content/recrutement'},
			]
		},
		{
			label: 'Star Citizen',
			subs: [
				{label: 'La flotte', href: '/squadron'},
				{label: 'Ligne du temps', href: '/timeline'},
				{label: 'Membres', href: '/members'},
			]
		},
		{label: 'Forums', key: 'forums', href: '/forums'},
		{label: 'Calendrier', key: 'calendar', href: '/calendar'},
		{label: 'Contact', key: 'contact', href: '/contact'},
	];
	res.locals.user = req.user;
	res.locals.dateformat = dateFormat;
	next();
};

/**
 Inits the error handler functions into `res`
 */
exports.initErrorHandlers = function (req, res, next) {

	res.err = function (err, title, message) {
		res.status(500).render('errors/500', {
			err: err,
			errorTitle: title,
			errorMsg: message
		});
	};

	res.notfound = function (title, message) {
		res.status(404).render('errors/404', {
			errorTitle: title,
			errorMsg: message
		});
	};

	next();

};


/**
 Fetches and clears the flashMessages before a view is rendered
 */
exports.flashMessages = function (req, res, next) {
	let flashMessages = {
		info: req.flash('info'),
		success: req.flash('success'),
		warning: req.flash('warning'),
		error: req.flash('error'),
	};
	res.locals.messages = _.some(flashMessages, function (msgs) {
		return msgs.length;
	}) ? flashMessages : false;
	next();
};


/**
 Prevents people from accessing protected pages when they're not signed in
 */
exports.requireUser = function (req, res, next) {
	if (!req.user) {
		req.flash('error', 'Merci de vous connecter pour accéder à cette page.');
		res.redirect('/keystone/signin');
	} else {
		next();
	}
};
