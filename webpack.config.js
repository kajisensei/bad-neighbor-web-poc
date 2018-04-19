const path = require('path');

module.exports = {
	entry: {
		RecrutementLogic: "./server/templates/views/forum/component/RecrutementLogic.jsx",
		ForumTopicLogic: "./server/templates/views/forum/component/ForumTopicLogic.jsx",
		ForumsHeaderLogic: "./server/templates/views/forum/component/ForumsHeaderLogic.jsx",
		AccountLogic: "./server/templates/views/web/jsx/AccountLogic.jsx",
		ForumTopicCreateLogic: "./server/templates/views/forum/component/ForumTopicCreateLogic.jsx",
		CalendarLogic: "./server/templates/views/calendar/CalendarLogic.jsx",
		ArticlesLogic: "./server/templates/views/web/jsx/ArticlesLogic.jsx",
		AuthLogic: "./server/templates/views/web/jsx/AuthLogic.jsx",
		GenericLogic: "./server/templates/views/web/jsx/GenericLogic.jsx",
		LibraryLogic: "./server/templates/views/web/jsx/LibraryLogic.jsx",
		MemberLogic: "./server/templates/views/web/jsx/MemberLogic.jsx",
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
