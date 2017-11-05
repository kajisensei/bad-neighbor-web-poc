import * as FetchUtils from "../../../../../public/js/utils/FetchUtils.jsx";
import LoadingModal from "../../widget/LoadingModal.jsx";
import SimpleMDEConfig from "../../widget/SimpleMDEConfig.jsx";

/**
 * Markdown editor
 */

const contentField = $("#generic-content");
const simplemde = SimpleMDEConfig.config(contentField[0]);

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
		$('#collapse-content').on('shown.bs.collapse', () => {
			simplemde.value(genericData.contenu || "Contenu");
		});
	}


	button.click(() => {
		let section = button.attr("section");
		let content = simplemde.value();
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
