/**
 * Created by Cossement Sylvain on 23-04-17.
 */
const keystone = require('keystone');
const Promise = require("bluebird");
const ForumTopic = keystone.list('ForumTopic');
const ForumMessage = keystone.list('ForumMessage');

exports = module.exports = (req, res) => {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	// Toujours associer une section pour correctement colorer le menu.
	locals.section = 'forums';
	locals.topicKey = req.params['topic'];

	// On chope le topic, tout en incrémentant le nombre de vues
	view.on("get", next => {
		const query = ForumTopic.model.findOneAndUpdate({
			"key": locals.topicKey
		}, {
			$inc: { 'stats.views': 1 } //TODO: pas updater si pagination
		},{
			new: true
		});

		query.exec((err, topic) => {
			if (err) {
				res.err(err, err.name, err.message);
				return;
			}
			locals.topic = topic;
			next();
		});
	});

	// TODO: on vérifie que le gars y ai accès

	// On chope les messages
	// TODO: Paginer
	view.on("get", next => {
		const query = ForumMessage.model.find().where("topic").equals(locals.topic.id).populate("createdBy updatedBy", "username avatar key").sort({"createdAt": 1});

		query.exec((err, messages) => {
			if (err) {
				res.err(err, err.name, err.message);
				return;
			}
			if (!messages.length) {
				res.err("", "Error in data coherence", "No message found for topic: " + locals.topic.key);
				return;
			}
			locals.topic_messages = messages;
			next();
		});
	});

	// Render the view
	view.render('forum/forum_topic');

};
