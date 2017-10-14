import * as FetchUtils from "../../../../../public/js/utils/FetchUtils.jsx";
import LoadingModal from "../../widget/LoadingModal.jsx";

(($) => {
	/**
	 * Edit message
	 */

	const modal = $("#message-edit-modal");
	const simplemde = new SimpleMDE({
		autoDownloadFontAwesome: false,
		element: $('#message-edit-field')[0],
		hideIcons: ["fullscreen", "side-by-side"],
		spellChecker: false
	});
	const button = $("#message-edit-modal-button");

	$('.edit-button').click(function () {
		let forId = $(this).attr("forId");
		let originalContent = $('#original-' + forId).val();
		let messageId = $(this).attr("messageId");

		modal.attr("messageId", messageId);
		modal.modal("show");

		setTimeout(() => {
			simplemde.value(originalContent);
		}, 200);
		
	});

	button.click(() => {
		let messageId = modal.attr("messageId");
		let content = simplemde.value();

		if(!content) {
			button.notify("Le contenu du sujet ne peut être vide !", {className: 'error', position: 'top'});
			return;
		}
		
		const data = {
			id: messageId,
			content: content
		};

		modal.modal('hide');
		const dialog = LoadingModal.show();
		FetchUtils.post('post', 'update', data, {
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
	
})(jQuery);
