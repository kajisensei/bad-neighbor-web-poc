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
		message_per_page: 10
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

/**
 * Inject all user rights (from groups and personal rights) into response locals.
 * Gets all info from DB to be sure to be "fresh". No cache should be done here.
 */
const User = keystone.list("User");
const UserRight = keystone.list("UserRight");
const mongoose = require("mongoose")
exports.injectUserRights = function (req, res, next) {
	if (req.user) {
		// Get user's groups and rights
		User.model.findOne()
			.where('_id').equals(req.user._id)
			.select('permissions.groups permissions.rights')
			.populate('permissions.groups')
			.exec((err, data) => {
				if (err)
					return res.err(err, "User permissions", "Can't get user groups and rights.");

				const allRightsIdsSet = new Set();
				for (group of data.permissions.groups) {
					for (rightID of group.rights) {
						allRightsIdsSet.add(mongoose.Types.ObjectId(rightID));
					}
				}
				for (rightID of data.permissions.rights) {
					allRightsIdsSet.add(mongoose.Types.ObjectId(rightID));
				}

				UserRight.model.find().where('_id').in(Array.from(allRightsIdsSet)).select('key')
					.exec((err, rights) => {
						if (err)
							return res.err(err, "User permissions", "Can't get the user's right: " + allRightsIdsSet);

						const rightKeysSet = new Set();
						for (right of rights) {
							rightKeysSet.add(right.key);
						}
						res.locals.rightKeysSet = rightKeysSet;
						next();
					});
			});
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
