const showdown = require('showdown'),
	xss = require('xss'),
	converter = new showdown.Converter({ extensions: ['tableExt'] });

exports = module.exports = {
	
	convertCategory: function(e) {
		if(e.publish.category === "sc")
			e.publish.category = "Star Citizen";
		else if(e.publish.category === "hd")
			e.publish.category = "Hardware";
		else if(e.publish.category === "jv")
			e.publish.category = "Jeux vidéo";
		else if(e.publish.category === "bn")
			e.publish.category = "Bad Neighbor";
	},
	
	markdownize: (text) => {
		text = converter.makeHtml(text);
		text = xss(text);
		text = text.replace(/YT\[([a-zA-Z0-9\_\-]+)\]/, (text, videoID) => {
			return `<iframe style="max-width: 100%;" width="560" height="315" src="https://www.youtube.com/embed/${xss(videoID)}" frameborder="0" allowfullscreen></iframe>`;
		});
		text = text.replace(/POLL\[([0-9]+)\]/, (text, pollId) => {
			return `<iframe src="http://www.strawpoll.me/embed_1/${xss(pollId)}" style="width:680px;height:350px;border:0;"></iframe>`;
		});
		return text;
	}
	
};
