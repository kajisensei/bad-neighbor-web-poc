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

const header_middleware = require('./header_middleware');

// Setup Route Bindings
exports = module.exports = function (app) {

	const sassMiddleware = require('node-sass-middleware');
	const path = require('path');
	app.use(sassMiddleware({
		src: path.join(__dirname, 'public'),
		dest: path.join(__dirname, 'public'),
		indentedSyntax: false, // true = .sass and false = .scss
		sourceMap: true
	}));
	
	const noCache = middleware.nocache, header = header_middleware.header;
	const requireUser = middleware.requireUser;

	/**
	 * Gestion des vues
	 */
	{
		// Web
		app.get('/', noCache, header, routes.views.web.index);
		app.all('/auth/:unauth?', noCache, routes.views.web.auth);
		app.get('/content/:contentKey', noCache, header, routes.views.web.generic);
		app.get('/articles', noCache, header, routes.views.web.articles);
		app.get('/article/:article', noCache, header, routes.views.web.article);
		app.get('/members', noCache, header, routes.views.web.members);
		app.get('/member/:member', noCache, header, routes.views.web.member);
		app.get('/characters', noCache, header, routes.views.web.characters);
		app.get('/version', noCache, header, routes.views.web.version);

		// Account
		app.get('/account', noCache, header, requireUser, routes.views.web.account);
		app.get('/activation/:token', noCache, header, routes.views.web.activation);

		// Calendar
		app.get('/calendar', noCache, header, routes.views.calendar.calendar);

		// Timeline
		app.get('/timeline', noCache, header, routes.views.timeline.timeline);

		// Forums
		app.get('/recrutement', noCache, header, routes.views.forum.recrutement);
		app.get('/forums', noCache, header, routes.views.forum.forums);
		app.get('/forum/:forum/:page?', noCache, header, routes.views.forum.forum);
		app.all('/forum-topic/:topic/:page?', noCache, header, routes.views.forum.forum_topic);
		app.all('/forum-topic-create/:forum', noCache, header, requireUser, routes.views.forum.forum_topic_create);
		app.get('/forum-topic-search', noCache, header, routes.views.forum.forum_search);

		// Chat
		app.get('/chat', noCache, header, routes.views.chat.discord);
	}


	/**
	 * API
	 */
	{
		app.post('/api/account/:action', noCache, header, routes.views.web.api.account_api);
		app.post('/api/generic/:action', noCache, header, routes.views.web.api.generic_api);
		app.post('/api/forums/:action', noCache, header, routes.views.forum.api.forums_api);
		app.post('/api/topic/:action', noCache, header, routes.views.forum.api.topic_api);
		app.post('/api/post/:action', noCache, header, routes.views.forum.api.post_api);
		app.post('/api/calendar/:action', noCache, header, routes.views.calendar.api.calendar_api);
	}
	
	// Files
	const GridFS = require("../gridfs/GridFS.js");
	app.get("/images/:path", (req, res) => {
		GridFS.get(req.params["path"], res, req);
	});

};
