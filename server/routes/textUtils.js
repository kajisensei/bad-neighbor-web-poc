const showdown = require('showdown'),
	xss = require('xss'),
	converter = new showdown.Converter({extensions: ['tableExt']});
const emojione = require('emojione');

exports = module.exports = {

	convertCategory: function (e) {
		if (e.publish.category === "sc")
			e.publish.category = "Star Citizen";
		else if (e.publish.category === "hd")
			e.publish.category = "Hardware";
		else if (e.publish.category === "jv")
			e.publish.category = "Jeux vidéo";
		else if (e.publish.category === "bn")
			e.publish.category = "Bad Neighbor";
	},

	markdownize: (text) => {
		text = converter.makeHtml(text);
		text = xss(text);
		text = text.replace(/YT\[([a-zA-Z0-9_\-]+)]/g, (text, videoID) => {
			return `<iframe style="max-width: 100%;" width="560" height="315" src="https://www.youtube.com/embed/${xss(videoID)}" frameborder="0" allowfullscreen></iframe>`;
		});
		text = text.replace(/POLL\[([0-9]+)]/g, (text, pollId) => {
			return `<iframe src="http://www.strawpoll.me/embed_1/${xss(pollId)}" style="width:680px;height:350px;border:0;"></iframe>`;
		});
		text = text.replace(/GIF\[([a-zA-Z0-9]+)]/g, (text, gifID) => {
			return `<img src='https://i.giphy.com/media/${gifID}/giphy.gif'"/>`;
		});
		text = text.replace(/EVENT\[([a-zA-Z0-9]+)]/g, (text, eventId) => {
			return `<bn-event data-id='${eventId}'"/>`;
		});
		text = emojione.shortnameToUnicode(text);
		return text;
	},

	formatLinkHTML: (text) => {
		text = text.replace(/(?:^|[^"'])(ftp|http|https|file):\/\/[\S]+(\b|$)/gim, '<a href="$&" class="my_link" target="_blank">$&</a>').replace(/([^\/])(www[^ <]+(\b|$))/gim, '$1<a href="http://$2" class="my_link" target="_blank">$2</a>');
		text = converter.makeHtml(text);
		text = xss(text);
		return text;
	},

	getRequestIP: (req) => {
		if (req) {
			return (req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].split(',').pop()) ||
				req.connection.remoteAddress ||
				req.socket.remoteAddress ||
				req.connection.socket.remoteAddress;
		}
	},

};
