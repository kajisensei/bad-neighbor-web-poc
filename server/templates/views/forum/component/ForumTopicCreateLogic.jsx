import * as FetchUtils from "../../../../../public/js/utils/FetchUtils.jsx";
import LoadingModal from "../../widget/LoadingModal.jsx";

/**
 * Markdown editor
 */

const contentField = $("#topic-content");
const simplemde = new SimpleMDE({ 
	element: contentField[0],
	hideIcons: ["fullscreen", "side-by-side"],
	spellChecker: false,
	renderingConfig: {
		singleLineBreaks: true,
	},
});

/**
 * Create
 */

const createButton = $('#create-button');
const topicField = $('#topic-field');

createButton.click(function() {

	const topicSubject = topicField.val();
	const content = simplemde.value();
	const forumId = createButton.attr("forumId");

	if(!forumId) {
		createButton.notify("Forum inconnu.", {className: 'error', position: 'bottom'});
		return;
	}
	
	if(!topicSubject) {
		topicField.notify("Le titre du sujet ne peut être vide !", {className: 'error', position: 'bottom'});
		return;
	}

	if(!content) {
		createButton.notify("Le contenu du sujet ne peut être vide !", {className: 'error', position: 'top'});
		return;
	}
	
	const data = {
		title: topicSubject,
		content: content,
		forum: forumId
	};

	const dialog = LoadingModal.show();
	FetchUtils.post('forum', 'topic-create', data, {
		success: result => {
			dialog.modal('hide');
			if (result.error) {
				createButton.notify(result.error, {className: 'error', position: 'top'});
			} else {
				location.href = result.url;
			}
		},
		fail: result => {
			dialog.modal('hide');
			$.notify(result, {className: 'error'});
		}
	});
	
});
