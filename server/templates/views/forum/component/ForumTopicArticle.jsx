import * as FetchUtils from "../../../../../public/js/utils/FetchUtils.jsx";
import LoadingModal from "../../widget/LoadingModal.jsx";

(() => {

	/*
	 * Topic publication
	 */

	const button = $('#topic-article-button');
	const topicKey = button.attr('topicKey');
	const topicName = button.attr('topicName');
	const popup = $("#topic-article-modal");
	const titleField = $('#topic-article-modal-title');

	button.click(function () {
		titleField.val(topicName);
		popup.modal('show');
	});

	$('#topic-article-modal-button').click(e => {

		const data = {
			title: titleField.val(),
			category: $('#topic-article-modal-select').val(),
			topicKey: topicKey
		};

		if (!data.title)
			return $.notify("Veuillez entrer un titre", "error");

		const dialog = LoadingModal.show();
		popup.modal('hide');
		FetchUtils.postUpload('topic', 'publish',
			[$('#topic-article-modal-image')[0].files[0]], data, {
				success: result => {
					if (result.error) {
						// Erreur serveur (erreur logique)
						$.notify((result.error.details && result.error.details[0]) || "An error occured (see logs)", 'error');
					} else {
						dialog.modal('hide');
						location.href = "/article/" + topicKey;
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
