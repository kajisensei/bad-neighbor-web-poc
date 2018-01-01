import * as FetchUtils from "../../../../../public/js/utils/FetchUtils.jsx";
import LoadingModal from "../../widget/LoadingModal.jsx";
import markdownEditor from "../../widget/markdown_editor.jsx";

(($) => {
	/**
	 * Edit message
	 */

	const modal = $("#message-edit-modal");
	const editor = markdownEditor.config("message-edit-field");
	const button = $("#message-edit-modal-button");

	$('.edit-button').click(function () {
		let forId = $(this).attr("forId");
		let originalContent = $('#original-' + forId).val();
		let messageId = $(this).attr("messageId");

		modal.attr("messageId", messageId);
		modal.modal("show");

		editor.val(originalContent);
	});

	button.click(() => {
		let messageId = modal.attr("messageId");
		let content = editor.val();

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
