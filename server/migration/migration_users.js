const fs = require('fs');
const dateFormat = require('dateformat');
const keystone = require('keystone');

const groups = JSON.parse(fs.readFileSync('server/migration/groups.json', 'utf8'));
const users = JSON.parse(fs.readFileSync('server/migration/user.json', 'utf8'));
const users_to_groups = JSON.parse(fs.readFileSync('server/migration/user_to_group.json', 'utf8'));

console.log("Groups: " + groups.length);
console.log("Users: " + users.length);

/***
 * Group mapping
 */

const nativeUserToNativeGroup = {};
for (const map of users_to_groups) {
	const group_id = map.group_id;
	const user_id = map.user_id;
	if (!nativeUserToNativeGroup[user_id]) {
		nativeUserToNativeGroup[user_id] = [];
	}
	nativeUserToNativeGroup[user_id].push(group_id);
}

/***
 * Import groups
 */

const nativeGroupIdToName = {};
const nativeGroupNameToId = {};

function importGroups() {

	console.log("Start importing groups");

	const UserGroup = keystone.list('UserGroup');

	const stack = [];
	
	const groupToDisplay = {
		"SC-Leader": 2,
		"SC-Officier": 3,
		"SC-Faucheur": 4,
		"SC-Corrupteur": 5,
		"BN original": 6,
		"SC-Recrue": 7
	};

	groups.forEach((group, index) => {

		const id = group.group_id;
		const name = group.group_name;
		const color = (group.group_colour && group.group_colour !== "" && "#" + group.group_colour) || undefined;

		nativeGroupIdToName[id] = name;

		stack.push(new UserGroup.model({
			name: name,
			isBN: groupToDisplay[name] !== undefined,
			order: groupToDisplay[name] || 999,
			color: color
		}));

	});

	const nextInStack = function () {
		const newelement = stack.pop();

		if (newelement) {
			newelement.save((err, u) => {
				if (err) {
					console.log(err.errors);
				} else {
					nativeGroupNameToId[u.name] = u.id;
					console.log("Added group: " + newelement.name);
				}
				nextInStack();
			});
		} else {
			console.log("Finish importing group !");
			importUsers();
		}
	};
	nextInStack();
}

/***
 * Import users
 */

function importUsers() {

	console.log("Start importing users");

	const User = keystone.list('User');

	const stack = [];

	for (const user of users) {
		const id = user.user_id;
		const username = user.username;
		const email = user.user_email;
		const registerDate = new Date(parseInt(user.user_regdate, 10) * 1000);

		if (!id || id === "" || !email || email === "") {
			console.log("Skip user: " + username);
			continue;
		}

		const nativeGroupIds = nativeUserToNativeGroup[id];
		const groups = [];
		for (const nativeID of nativeGroupIds || []) {
			const name = nativeGroupIdToName[nativeID];
			const newId = nativeGroupNameToId[name];
			if (newId) {
				groups.push(newId);
			}
		}

		stack.push(new User.model({
			username: username,
			email: email,
			password: "bar",
			createdAt: registerDate,
			permissions: {
				groups: groups
			}
		}));

	}

	const nextInStack = function () {
		const newelement = stack.pop();

		if (newelement) {
			newelement.save((err, u) => {
				if (err) {
					console.log(err.errors);
				} else {
					console.log("Added user: " + newelement.username);
				}
				nextInStack();
			});
		} else {
			console.log("Finish !");
		}
	};
	nextInStack();
}

/***
 * launch
 */

importGroups();
