import * as FetchUtils from "../../../../../public/js/utils/FetchUtils.jsx";
import LoadingModal from "../../widget/LoadingModal.jsx";

(($) => {
	/**
	 * Edit topic
	 */

	const modal = $("#topic-edit-modal");
	const button = $("#topic-edit-modal-button");
	const titleField = $('#topic-field');
	const tagsSelect = $('#topic-tags').select2({
		width: "100%"
	});

	$('.edit-topic-button').click(function () {
		titleField.val(topicInfo.name);
		tagsSelect.val();
		modal.modal("show");
	});

	button.click(() => {
		const topicSubject = titleField.val();
		
		if(!topicSubject) {
			titleField.notify("Le titre du sujet ne peut être vide !", {className: 'error', position: 'bottom'});
			return;
		}
		
		const data = {
			id: topicInfo._id,
			title: topicSubject,
			tags: tagsSelect.val() || []
		};

		modal.modal('hide');
		const dialog = LoadingModal.show();
		FetchUtils.post('topic', 'update', data, {
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
