import * as FetchUtils from "../../../../public/js/utils/FetchUtils.jsx";

let giphy = require('giphy-api')('tfhJv5ctIu3ke536XKsJyEi5wG2IUlY4');

const editorInsertText = (textarea, txtToAdd) => {
	const caretPos = textarea[0].selectionStart;
	const textAreaTxt = textarea.val();
	textarea.val(textAreaTxt.substring(0, caretPos) + txtToAdd + textAreaTxt.substring(caretPos));
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

		wrapper.find(".emoji-smile").click(() => {
			editorInsertText(textarea, ":smile:");
		});
		wrapper.find(".emoji-poop").click(() => {
			editorInsertText(textarea, ":poop:");
		});
		wrapper.find(".emoji-rofl").click(() => {
			editorInsertText(textarea, ":rofl:");
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

		// gifs
		const gifsSearch = $(`#${idPrefix}-gifs`);
		const gifsSearchModal = $(`#${idPrefix}-gifs-modal`);
		const gifsSearchModalContainer = $(`#${idPrefix}-gifs-modal-container`);

		gifsSearch.keypress(e => {
			if (e.which === 13) {
				gifsSearch.prop('disabled', true);
				const search = gifsSearch.val();
				giphy.search(search, function (err, res) {
					gifsSearch.prop('disabled', false);
					if (res && res.data) {
						if (res.data.length) {
							gifsSearchModalContainer.empty();
							res.data.forEach(gif => {
								gifsSearchModalContainer.append( `<img class="gif-preview" src='https://i.giphy.com/media/${gif.id}/giphy-preview.gif' gif="${gif.id}"/>` );
							});
							gifsSearchModal.modal('show');
							$("img.gif-preview").click(e => {
								const gifId = $(e.target).attr('gif');
								editorInsertText(textarea, `GIF[${gifId}]`);
								gifsSearchModal.modal('hide');
							});
						} else {
							$.notify(`Aucun GIFs trouvé pour cette recherche.`, {className: 'error'});
						}
					}
				});
			}
		});

		return textarea;
	}

}
