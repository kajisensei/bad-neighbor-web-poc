const path = require('path');

module.exports = {
	entry: {
		RecrutementLogic: "./server/templates/views/forum/component/RecrutementLogic.jsx",
		ForumTopicLogic: "./server/templates/views/forum/component/ForumTopicLogic.jsx",
		AccountLogic: "./server/templates/views/web/jsx/AccountLogic.jsx",
		ForumTopicCreateLogic: "./server/templates/views/forum/component/ForumTopicCreateLogic.jsx",
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
