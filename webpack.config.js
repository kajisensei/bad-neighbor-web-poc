const path = require('path');

module.exports = {
	entry: {
		ForumTopicArticle: "./server/templates/views/forum/component/ForumTopicArticle.jsx",
		ForumTopicSelection: "./server/templates/views/forum/component/ForumTopicSelection.jsx",
		ForumTopicRemove: "./server/templates/views/forum/component/ForumTopicRemove.jsx",
		RecrutementLogic: "./server/templates/views/forum/component/RecrutementLogic.jsx",
		AccountLogic: "./server/templates/views/web/jsx/AccountLogic.jsx",
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
