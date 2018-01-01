import * as FetchUtils from "../../../../public/js/utils/FetchUtils.jsx";

export default {

	config: function (idPrefix) {
		const textarea = $(`#${idPrefix}`);
		const preview = $(`#${idPrefix}-preview`);
		const previewButton = $(`#${idPrefix}-preview-b`);

		preview.hide();
		textarea.show();
		previewButton.click(() => {
			preview.toggle();
			textarea.toggle();
			if (preview.is(":visible")) {
				preview.text("Chargement de l'aperçu...");
				FetchUtils.post('post', 'preview', {raw: textarea.val()}, {
					success: result => {
						if (result.error) {
							$.notify(result.error, {className: 'error', position: 'top'});
						} else {
							preview.html(result.markdown);
						}
					},
					fail: result => {
						$.notify(result, {className: 'error'});
					}
				});
				previewButton.text("Quitter l'aperçu");
			} else {
				previewButton.text("Aperçu");
			}
		});

		return textarea;
	}

}
