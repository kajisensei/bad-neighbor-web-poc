const pmx = require('pmx').init();

// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
require('dotenv').config();

// App config
require('./server/config.js');

// Require keystone
const keystone = require('keystone');

// Initialise Keystone with your project's configuration.
// See http://keystonejs.com/guide/config for available options
// and documentation.

keystone.init({
	'name': 'Bad Neighbor',
	'brand': 'Bad Neighbor',

	'sass': 'public',
	'static': 'public',
	'favicon': 'public/favicon.ico',
	'views': 'server/templates/views',
	'view engine': 'pug',

	'mongo': process.env.MONGO_URI || "mongodb://localhost/bad-website",
	'model prefix': 'ksjs',

	'auto update': true,
	'session': true,
	'auth': (req, res, next) => {
		if (!req.user || !req.user.canAccessKeystone) {
			req.flash('error', 'Merci de vous connecter pour accéder à cette page.');
			res.redirect(`/auth/signout?from=${req.originalUrl}`);
			return;
		}
		next();
	},
	'signin url': "/auth",
	'session store': "mongo",
	'user model': 'User',

	'cookie signin': true,
	'cookie signin options': {
		signed: true,
		httpOnly: true,
		maxAge: 10 * 24 * 60 * 60 * 1000,
	},

	'wysiwyg override toolbar': false,
	'wysiwyg menubar': true,
	'wysiwyg additional plugins': "hr, visualblocks, media, table, image, fullscreen, autolink",
	
	'logger': ':method :url :status :response-time ms :remote-addr :req[x-forwarded-for]'
});

// Load your project's Models
keystone.import('server/models');

// Setup common locals for your templates. The following are required for the
// bundled templates and layouts. Any runtime locals (that should be set uniquely
// for each request) should be added to ./routes/middleware.js
keystone.set('locals', {
	_: require('lodash'),
	env: keystone.get('env'),
	utils: keystone.utils,
	editable: keystone.content.editable,
});

// Load your project's Routes
keystone.set('routes', require('./server/routes'));


// Configure the navigation bar in Keystone's Admin UI
keystone.set('nav', {
	Website: ['GenericPage', 'CalendarEntry', 'TimelineEntry', 'Log'],
	Forum: ['Forum', 'ForumTopic', 'ForumMessage', 'ForumTopicTag', 'ForumTopicTemplate'],
	BDD: ['scjobs', 'scships'],
	utilisateurs: ['users', 'UserGroup', 'UserMedal'],
});

// Start Keystone to connect to your database and initialise the web server

keystone.start();

require("./server/apps/DiscordBot.js");

// Migration tests
// require('./server/migration/migration_users.js');
