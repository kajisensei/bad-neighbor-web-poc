const path = require('path');

module.exports = {
	entry: {
		RecrutementLogic: "./server/templates/views/forum/component/RecrutementLogic.jsx",
		ForumTopicLogic: "./server/templates/views/forum/component/ForumTopicLogic.jsx",
		AccountLogic: "./server/templates/views/web/jsx/AccountLogic.jsx",
		ForumTopicCreateLogic: "./server/templates/views/forum/component/ForumTopicCreateLogic.jsx",
		CalendarLogic: "./server/templates/views/calendar/CalendarLogic.jsx",
		ArticlesLogic: "./server/templates/views/web/jsx/ArticlesLogic.jsx",
		AuthLogic: "./server/templates/views/web/jsx/AuthLogic.jsx",
	},
	output: {
		path: path.join(__dirname, "public/compiled"),
		filename: "[name]_client.js"
	},
	module: {
		loaders: [
			{
				test: /\.jsx$/,
				exclude: /(node_modules|bower_components)/,
				loader: 'babel-loader'
			}
		]
	}
};
