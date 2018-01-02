import * as FetchUtils from "../../../../public/js/utils/FetchUtils.jsx";

const editorInsertText = (textarea, txtToAdd) => {
	const caretPos = textarea[0].selectionStart;
	const textAreaTxt = textarea.val();
	textarea.val(textAreaTxt.substring(0, caretPos) + txtToAdd + textAreaTxt.substring(caretPos) );
};

export default {

	config: function (idPrefix) {
		const textarea = $(`#${idPrefix}`);
		const preview = $(`#${idPrefix}-preview`);
		const previewButton = $(`#${idPrefix}-preview-b`);

		const wrapper = textarea.parent();
		
		const yt = wrapper.find(".tool-yt");
		yt.click(() => {
			editorInsertText(textarea, "YT[id_de_la_video]");
		});
		yt.tooltip({
			title: "Insérer une balise de vidéo Youtube"
		});
		
		const straw = wrapper.find(".tool-straw");
		straw.click(() => {
			editorInsertText(textarea, "POLL[id_du_strawpoll]");
		});
		straw.tooltip({
			title: "Insérer une balise de sondage Strawpoll"
		});

		preview.hide();
		wrapper.show();
		previewButton.click(() => {
			preview.toggle();
			wrapper.toggle();
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
