import ForumTopicArticle from "./ForumTopicArticle.jsx";
import ForumTopicRemove from "./ForumTopicRemove.jsx";
import ForumTopicSelection from "./ForumTopicSelection.jsx";
import * as FetchUtils from "../../../../../public/js/utils/FetchUtils.jsx";

/**
 * Switch button
 */

$('.switch-button').click(function() {
	let button = $(this);
	let id = button.attr("forId");
	$('#original-' + id).toggle();
	$('#content-' + id).toggle();
});


/**
 * Post message
 */

const contentField = $("#post-textarea");
const simplemde = new SimpleMDE({
	element: contentField[0],
	hideIcons: ["fullscreen", "side-by-side"],
	spellChecker: false
});

const postButton = $('#post-button');

postButton.click(function() {

	const content = simplemde.value();
	const topicId = postButton.attr("topicId");

	if(!content) {
		postButton.notify("Le message ne peut être vide !", {className: 'error', position: 'top'});
		return;
	}

	const data = {
		content: content,
		topic: topicId
	};

	postButton.attr('disabled', true);
	FetchUtils.post('forum', 'message-create', data, {
		success: result => {
			if (result.error) {
				postButton.attr('disabled', false);
				postButton.notify(result.error, {className: 'error', position: 'top'});
			} else {
				location.reload();
			}
		},
		fail: result => {
			postButton.attr('disabled', false);
			$.notify(result, {className: 'error'});
		}
	});

});
