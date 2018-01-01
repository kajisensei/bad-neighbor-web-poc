import * as FetchUtils from "../../../../../public/js/utils/FetchUtils.jsx";
import LoadingModal from "../../widget/LoadingModal.jsx";
import markdownEditor from "../../widget/markdown_editor.jsx";

/**
 * Markdown editor
 */

const editor = markdownEditor.config("generic-content");

/**
 * Create
 */

const button = $('#save-button');
const deleteButton = $('#delete-button');
const titleField = $('#generic-title');

(($) => {

	/**
	 * Pages generiques
	 */

	if (genericData) {
		titleField.val(genericData.name || "Titre de la page");
		editor.val(genericData.contenu || "Contenu");
	}


	button.click(() => {
		let section = button.attr("section");
		let content = editor.val();
		let title = titleField.val();

		if(!content) {
			button.notify("Le contenu de la page ne peut être vide !", {className: 'error', position: 'top'});
			return;
		}

		if(!title) {
			button.notify("Le titre de la page ne peut être vide !", {className: 'error', position: 'top'});
			return;
		}

		const data = {
			title: title,
			section: section,
			content: content
		};

		const dialog = LoadingModal.show();
		FetchUtils.post('generic', 'update', data, {
			success: result => {
				dialog.modal('hide');
				if (result.error) {
					$.notify(result.error, {className: 'error', position: 'top'});
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

	deleteButton.click(() => {
		let section = button.attr("section");

		bootbox.confirm("Supprimer le contenu de cette page ?<br/>L'action n'est pas réversible.", result => {
			if (result) {
				const data = {
					section: section
				};

				const dialog = LoadingModal.show();
				FetchUtils.post('generic', 'remove', data, {
					success: result => {
						dialog.modal('hide');
						if (result.error) {
							$.notify(result.error, {className: 'error', position: 'top'});
						} else {
							location.reload();
						}
					},
					fail: result => {
						dialog.modal('hide');
						$.notify(result, {className: 'error'});
					}
				});
			}
		});

	});

})(jQuery);
