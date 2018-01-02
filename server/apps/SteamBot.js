const jsdom = require('jsdom');

const data = {};

// Launch parser asynchrounously
console.log("Requesting steam page content.");
jsdom.JSDOM.fromURL("http://steamcommunity.com/groups/Bad-neighbor-fr#members").then(jsdom => {
	const $ = require('jquery')(jsdom.window);

	data.members_count = $(".rightbox .membercounts .membercount.members .count").text();
	data.members_online_count = $(".rightbox .membercounts .membercount.online .count").text();
	data.members_ingame_count = $(".rightbox .membercounts .membercount.ingame .count").text();

	data.games = [];
	$(".rightbox .group_associated_game").each((index, e) => {
		const game = $(e).text().trim();
		data.games.push(game);
	});

});

// jsdom.JSDOM.fromURL("http://steamcommunity.com/groups/Bad-neighbor-fr/members").then(jsdom => {
// 	const $ = require('jquery')(jsdom.window);
//
// 	data.members = [];
//
// 	$(".member_block .member_block_content").each((index, e) => {
// 		const elem = $(e);
// 		const isIngame = elem.hasClass("in-game");
// 		const isOnline = elem.hasClass("online");
// 		const name = elem.find("a.linkFriend").text();
// 		data.members.push({
// 			name: name,
// 			isIngame: isIngame,
// 			isOnline: isIngame || isOnline
// 		});
// 	});
//
// 	console.log(data);
// });

exports = module.exports = {

	getData: () => {
		return members;
	}

};
