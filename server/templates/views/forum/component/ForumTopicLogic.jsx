import ForumTopicArticle from "./ForumTopicArticle.jsx";
import ForumTopicRemove from "./ForumTopicRemove.jsx";
import ForumTopicSelection from "./ForumTopicSelection.jsx";
import ForumTopicPinned from "./ForumTopicPinned.jsx";
import ForumTopicAnnounce from "./ForumTopicAnnounce.jsx";
import ForumTopicLock from "./ForumTopicLock.jsx";
import ForumTopicEdit from "./ForumTopicEdit.jsx";
import ForumTopicMessageEdit from "./ForumTopicMessageEdit.jsx";
import ForumTopicUnpublish from "./ForumTopicUnpublish.jsx";
import * as FetchUtils from "../../../../../public/js/utils/FetchUtils.jsx";
import LoadingModal from "../../widget/LoadingModal.jsx";
import markdownEditor from "../../widget/markdown_editor.jsx";

/**
 * Switch button
 */

$('.switch-button').click(function () {
	let button = $(this);
	let id = button.attr("forId");
	$('#original-' + id).toggle();
	$('#content-' + id).toggle();
});


/**
 * Post message
 */

const contentField = markdownEditor.config("post-textarea");

const postButton = $('#post-button');

postButton.click(function () {

	const content = contentField.val();
	const topicId = postButton.attr("topicId");
	const topicKey = postButton.attr("topicKey");

	if (!content) {
		postButton.notify("Le message ne peut être vide !", {className: 'error', position: 'top'});
		return;
	}

	const data = {
		content: content,
		topic: topicId
	};

	const dialog = LoadingModal.show();
	FetchUtils.post('post', 'create', data, {
		success: result => {
			dialog.modal('hide');
			if (result.error) {
				postButton.notify(result.error, {className: 'error', position: 'top'});
			} else {
				if(location.href.indexOf(`/forum-topic/${topicKey}/last`) === -1)
					location.href = `/forum-topic/${topicKey}/last#message-last`;
				else 
					location.reload();
			}
		},
		fail: result => {
			dialog.modal('hide');
			$.notify(result, {className: 'error'});
		}
	});

});

/**
 * Citer
 */

$('.quote-button').click(function () {
	let forId = $(this).attr("forId");
	let originalContent = $('#original-' + forId).val();
	let date = $('#date-' + forId)[0].innerText;
	let author = $(this).attr("author");

	const lines = originalContent.split("\n");
	for (let i = 0; i < lines.length; i++) {
		lines[i] = "> " + lines[i];
	}
	originalContent = "> Par " + author + ", " + date + "\n> ***\n" + lines.join("\n") + "\n\n";

	window.scrollTo(0, document.body.scrollHeight);

	contentField.val(originalContent);
});
