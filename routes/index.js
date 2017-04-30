/**
 * This file is where you define your application routes and controllers.
 *
 * Start by including the middleware you want to run for every request;
 * you can attach middleware to the pre('routes') and pre('render') events.
 *
 * For simplicity, the default setup for route controllers is for each to be
 * in its own file, and we import all the files in the /routes/views directory.
 *
 * Each of these files is a route controller, and is responsible for all the
 * processing that needs to happen for the route (e.g. loading data, handling
 * form submissions, rendering the view template, etc).
 *
 * Bind each route pattern your application should respond to in the function
 * that is exported from this module, following the examples below.
 *
 * See the Express application routing documentation for more information:
 * http://expressjs.com/api.html#app.VERB
 */

const keystone = require('keystone');
const middleware = require('./middleware');
const importRoutes = keystone.importer(__dirname);
const showdown = require("showdown");

require('mongoose').Promise = require('bluebird');

require('./apps/DiscordBot');

// Markdown configuration
showdown.setOption('simpleLineBreaks', false);
showdown.setOption('openLinksInNewWindow', true);
showdown.setOption('ghMentions', true);
showdown.setOption('ghMentionsLink', "/members/{u}");


// Common Middleware
keystone.pre('routes', middleware.initErrorHandlers);
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Handle 404 errors
keystone.set('404', function (req, res, next) {
	res.notfound();
});

// Handle other errors
keystone.set('500', function (err, req, res, next) {
	let title, message;
	if (err instanceof Error) {
		message = err.message;
		err = err.stack;
	}
	res.err(err, title, message);
});

// Import Route Controllers
let routes = {
	web: importRoutes('./views/web'),
	forum: importRoutes('./views/forum'),
	calendar: importRoutes('./views/calendar'),
	timeline: importRoutes('./views/timeline'),
};

// Setup Route Bindings
exports = module.exports = function (app) {

	// Web
	app.get('/', routes.web.index);
	app.all('/auth/:unauth?', routes.web.auth);
	app.all('/chat', routes.web.chat);
	app.get('/content/:contentKey', routes.web.generic);
	app.get('/articles', routes.web.articles);
	app.get('/article/:article', routes.web.article);
	app.get('/members', routes.web.members);

	// Calendar
	app.get('/calendar', middleware.requireUser, routes.calendar.calendar);

	// Timeline
	app.get('/timeline', routes.timeline.timeline);

	// Forums
	app.get('/forums', routes.forum.forums);
	app.get('/forum/:forum', routes.forum.forum);
	app.all('/forum-topic-create/:forum', routes.forum.forum_topic_create);
	app.all('/forum-topic/:topic', routes.forum.forum_topic);

	// File upload
	const upload = require("./upload/upload");
	app.post('/uploads/add', middleware.requireUserOrError, upload.add);
	app.delete("/uploads/delete/:uuid", middleware.requireUserOrError, upload.remove);

};
