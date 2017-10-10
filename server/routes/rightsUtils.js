exports = module.exports = {

	getExcludedTags: function(user, forumTags) {
		const groupAsString = [];
		if (user)
			user.permissions.groups.forEach(g => groupAsString.push(String(g)));

		// Vérifier les tags auxquels le user a accès
		const excludedTags = new Set();
		(forumTags || {}).forEach(tag => {
			if (tag.groups && tag.groups.length) {
				if (!user) {
					excludedTags.add(tag._id + '');
				} else {

					let temp = [...tag.groups];
					temp = temp.filter((g) => groupAsString.includes(String(g)));

					if (!temp.length)
						excludedTags.add(tag._id + '');
				}
			}
		});
		return [...excludedTags];
	},
	
	canXXX: function(action, forum, user) {
		const forumRights = [];
		forum[action].forEach(e => forumRights.push(String(e)));
		return forumRights.length === 0 || (user && user.permissions.groups.find(e => forumRights.includes(String(e))) !== undefined);
	}

};
