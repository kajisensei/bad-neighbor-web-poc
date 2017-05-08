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
	views: importRoutes('./views'),
};

// Setup Route Bindings
exports = module.exports = function (app) {

	// Web
	app.get('/', routes.views.web.index);
	app.all('/auth/:unauth?', routes.views.web.auth);
	app.all('/chat', routes.views.web.chat);
	app.get('/content/:contentKey', routes.views.web.generic);
	app.get('/articles', routes.views.web.articles);
	app.get('/article/:article', routes.views.web.article);
	app.get('/members', routes.views.web.members);
	app.get('/member/:member', routes.views.web.member);

	// Calendar
	app.get('/calendar', middleware.requireUser, routes.views.calendar.calendar);

	// Timeline
	app.get('/timeline', routes.views.timeline.timeline);

	// Forums
	app.get('/forums', routes.views.forum.forums);
	app.get('/forum/:forum', routes.views.forum.forum);
	app.all('/forum-topic-create/:forum', routes.views.forum.forum_topic_create);
	app.all('/forum-topic/:topic', middleware.injectUserRights, routes.views.forum.forum_topic);

	// File upload
	const upload = require("./upload/upload");
	app.post('/uploads/add', middleware.requireUserOrError, upload.add);
	app.delete("/uploads/delete/:uuid", middleware.requireUserOrError, upload.remove);

};
