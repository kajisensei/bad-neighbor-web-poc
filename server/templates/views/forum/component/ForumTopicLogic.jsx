import ForumTopicArticle from "./ForumTopicArticle.jsx";
import ForumTopicRemove from "./ForumTopicRemove.jsx";
import ForumTopicSelection from "./ForumTopicSelection.jsx";
import * as FetchUtils from "../../../../../public/js/utils/FetchUtils.jsx";
import LoadingModal from "../../widget/LoadingModal.jsx";

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

const contentField = $("#post-textarea");
let simplemde;
if(contentField.length) {
	simplemde = new SimpleMDE({
		element: contentField[0],
		hideIcons: ["fullscreen", "side-by-side"],
		spellChecker: false
	});
}

const postButton = $('#post-button');

postButton.click(function () {

	const content = simplemde.value();
	const topicId = postButton.attr("topicId");

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

	location.href = "#reply-section";

	simplemde.value(originalContent);
});
