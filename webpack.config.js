const path = require('path');

module.exports = {
	entry: {
		ForumTopicArticle: "./server/templates/views/forum/component/ForumTopicArticle.jsx",
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
