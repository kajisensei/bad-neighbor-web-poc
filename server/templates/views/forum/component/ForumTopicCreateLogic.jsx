import * as FetchUtils from "../../../../../public/js/utils/FetchUtils.jsx";
import LoadingModal from "../../widget/LoadingModal.jsx";
import markdownEditor from "../../widget/markdown_editor.jsx";

(($) => {

	/**
	 * Markdown editor
	 */

	const contentField = markdownEditor.config("topic-content");

	/**
	 * Create
	 */

	const createButton = $('#create-button');
	const topicField = $('#topic-field');
	const tagsSelect = $('#topic-tags').select2();

	createButton.click(function () {

		const topicSubject = topicField.val();
		const content = contentField.val();
		const forumId = createButton.attr("forumId");

		if (!forumId) {
			$.notify("Forum inconnu.", {className: 'error', position: 'top'});
			return;
		}

		if (!topicSubject) {
			$.notify("Le titre du sujet ne peut être vide !", {className: 'error', position: 'top'});
			return;
		}

		if (!content) {
			$.notify("Le contenu du sujet ne peut être vide !", {className: 'error', position: 'top'});
			return;
		}

		const data = {
			title: topicSubject,
			content: content,
			forum: forumId,
			tags: tagsSelect.val()
		};

		const dialog = LoadingModal.show();
		FetchUtils.post('topic', 'create', data, {
			success: result => {
				dialog.modal('hide');
				if (result.error) {
					$.notify(result.error, {className: 'error', position: 'top'});
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

	/**
	 * Template
	 */

	$('.template-button').click((e) => {

		const button = $(e.target);
		const templateId = button.attr("templateId");

		bootbox.confirm('Charger ce template ? Le contenu actuel de votre message sera perdu.', result => {
			if (result) {
				topicTemplates.forEach(template => {
					if (template._id === templateId) {
						contentField.val(template.contenu);
					}
				});
			}
		});

	});

})(jQuery);
