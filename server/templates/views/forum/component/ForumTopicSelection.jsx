import * as FetchUtils from "../../../../../public/js/utils/FetchUtils.jsx";
import LoadingModal from "../../widget/LoadingModal.jsx";

(() => {

	/*
	 * Topic selection
	 */

	const button = $('#topic-selection-button');
	const topicKey = button.attr('topicKey');
	const popup = $("#topic-selection-modal");

	button.click(function () {
		popup.modal('show');
	});

	$('#topic-selection-modal-button').click(e => {

		const dialog = LoadingModal.show();
		popup.modal('hide');
		FetchUtils.post('topic', 'selection',
			{
				category: $('#topic-selection-modal-select').val(),
				topicKey: topicKey
			}, {
				success: result => {
					if (result.error) {
						// Erreur serveur (erreur logique)
						$.notify((result.error.details && result.error.details[0]) || "An error occured (see logs)", 'error');
					} else {
						dialog.modal('hide');
						location.reload();
					}
				},
				fail: result => {
					// Erreur
					dialog.modal('hide');
					$.notify(result, {className: 'error'});
				}
			});
	});

})(jQuery);
