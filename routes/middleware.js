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

/*
 * Préférences applications
 */

const prefs = {
	forum: {
		topic_per_page: 20
	}
};

/**
 Initialises the standard view locals

 The included layout depends on the navLinks array to generate
 the navigation in the header, you may wish to change this array
 or replace it with your own templates / logic.
 */
exports.initLocals = function (req, res, next) {
	res.locals.navLinks = [
		{label: 'Accueil', key: 'home', href: '/'},
		{label: 'Articles', key: 'articles', href: '/articles'},
		{
			label: 'Le clan',
			key: 'clan',
			subs: [
				{label: 'Présentation', href: '/content/presentation'},
				{label: 'Charte', href: '/content/charte'},
				{label: 'Recrutement', href: '/content/recrutement'},
				{label: 'Membres', href: '/members'},
			]
		},
		{
			label: 'Star Citizen',
			key: 'starcitizen',
			subs: [
				{label: 'La flotte', href: '/content/flotte'},
				{label: 'Ligne du temps', href: '/timeline'},
				{label: 'Les personnages', href: '/characters'},
			]
		},
		{label: 'Calendrier', key: 'calendar', href: '/calendar'},
		{label: 'Forums', key: 'forums', href: '/forums'},
		{label: 'Chat', key: 'chat', href: '/chat'},
	];
	res.locals.user = req.user;
	res.locals.dateformat = dateFormat;
	res.locals.prefs = prefs;
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
		res.redirect(`/auth?from=${req.originalUrl}`);
	} else {
		next();
	}
};

exports.requireUserOrError = function (req, res, next) {
	if (!req.user) {
		res.status(401).end();
	} else {
		next();
	}
};
