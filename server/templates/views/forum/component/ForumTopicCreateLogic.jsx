import * as FetchUtils from "../../../../../public/js/utils/FetchUtils.jsx";

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
		topicField.notify("Le sujet ne peut être vide !", {className: 'error', position: 'bottom'});
		return;
	}

	if(!content) {
		createButton.notify("Le contenu ne peut être vide !", {className: 'error', position: 'top'});
		return;
	}
	
	const data = {
		title: topicSubject,
		content: content,
		forum: forumId
	};

	createButton.attr('disabled', true);
	FetchUtils.post('forum', 'topic-create', data, {
		success: result => {
			if (result.error) {
				createButton.attr('disabled', false);
				createButton.notify(result.error, {className: 'error', position: 'top'});
			} else {
				location.href = result.url;
			}
		},
		fail: result => {
			createButton.attr('disabled', false);
			$.notify(result, {className: 'error'});
		}
	});
	
});
