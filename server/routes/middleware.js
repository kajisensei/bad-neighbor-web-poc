/**
 * This file contains the common middleware used by your routes.
 *
 * Extend or replace these functions as your application requires.
 *
 * This structure is not enforced, and just a starting point. If
 * you have more middleware you may want to group it as separate
 * modules in your project's /lib directory.
 */
const _ = require('lodash');
const dateFormat = require('dateformat');
const keystone = require("keystone");

/*
 * Préférences applications
 */

const prefs = {
	forum: {
		topic_per_page: 20,
		topic_per_search: 50,
		message_per_page: 10,
		publish_image_size: 720,
	},
	member: {
		last_count: 5,
		avatar_max_size: 140
	}
};

/**
 * Traduction du dateformat
 */

dateFormat.i18n = {
	dayNames: [
		'Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam',
		'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
	],
	monthNames: [
		'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Dec',
		'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
	]
};

/**
 Initialises the standard view locals
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
				{label: 'Où nous trouver', href: '/content/where'},
				{label: 'Charte', href: '/content/charte'},
				{label: 'Membres', href: '/members'},
				{label: 'Financement', href: '/content/faire-un-don'},
			]
		},
		{
			label: 'Star Citizen',
			key: 'starcitizen',
			subs: [
				{label: 'La flotte', href: '/content/flotte'},
				{label: 'Ligne du temps', href: '/timeline'},
				{label: 'Les criminels', href: '/characters'},
				{label: 'McCoy 3D', href: '/mccoy'},
			]
		},
		{
			label: 'Sponsor',
			key: 'sponsor',
			subs: [
				{label: 'Da lettre ouverte', href: '/content/da-lettre-ouverte'},
				{label: 'Da historique', href: '/content/da-historique'},
				{label: 'Da boutique', href: '/content/da-boutique'},
				{label: 'Da paiement', href: '/content/da-paiement'},
			]
		},
		{label: 'Calendrier', key: 'calendar', href: '/calendar'},
		{label: 'Forums', key: 'forums', href: '/forums'},
		{label: 'Recrutement', key: 'recrutement', href: '/recrutement'},
	];
	res.locals.user = req.user;
	res.locals.dateformat = dateFormat;
	res.locals.prefs = prefs;
	res.locals.originalUrl = req.originalUrl;
	res.locals.formatMessage = require('format-message');
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

/**
 * Same as requireUser but send back a 401 instead of redirecting.
 * Useful for AJAX calls.
 */
exports.requireUserOrError = function (req, res, next) {
	if (!req.user) {
		res.status(401).end();
	} else {
		next();
	}
};

exports.nocache = function (req, res, next) {
	res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	res.header('Expires', '-1');
	res.header('Pragma', 'no-cache');
	next();
};
