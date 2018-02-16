import * as FetchUtils from "../../../../public/js/utils/FetchUtils.jsx";

let giphy = require('giphy-api')({
	apiKey: 'tfhJv5ctIu3ke536XKsJyEi5wG2IUlY4',
	https: true
});

function setSelectionRange(input, selectionStart, selectionEnd) {
	if (input.setSelectionRange) {
		input.focus();
		input.setSelectionRange(selectionStart, selectionEnd);
	} else if (input.createTextRange) {
		const range = input.createTextRange();
		range.collapse(true);
		range.moveEnd('character', selectionEnd);
		range.moveStart('character', selectionStart);
		range.select();
	}
}

const editorInsertText = (textarea, txtToAdd, wrapStartPos, wrapEndPos) => {
	wrapStartPos = wrapStartPos || txtToAdd.length;
	wrapEndPos = wrapEndPos || txtToAdd.length;
	const caretPos = textarea[0].selectionStart;
	const textAreaTxt = textarea.val();
	textarea.val(textAreaTxt.substring(0, caretPos) + txtToAdd + textAreaTxt.substring(caretPos));
	setSelectionRange(textarea[0], caretPos + wrapStartPos, caretPos + wrapEndPos);
};

const editorWrapText = (textarea, textStart, textEnd, wrapStartPos, wrapEndPos) => {
	textEnd = textEnd || textStart;
	const caretPos = textarea[0].selectionStart;
	const caretPosEnd = textarea[0].selectionEnd;
	const textAreaTxt = textarea.val();

	if (caretPos < caretPosEnd) {
		textarea.val(textAreaTxt.substring(0, caretPos) + textStart + textAreaTxt.substring(caretPos, caretPosEnd) + textEnd + textAreaTxt.substring(caretPosEnd));

		if(wrapStartPos && wrapEndPos) {
			setSelectionRange(textarea[0], caretPos + wrapStartPos, caretPos + wrapEndPos);
		} else {
			setSelectionRange(textarea[0], caretPosEnd + (textStart.length + textEnd.length), caretPosEnd + (textStart.length + textEnd.length));
		}
	} else {
		textarea.val(textAreaTxt.substring(0, caretPos) + textStart + textEnd + textAreaTxt.substring(caretPos));
		setSelectionRange(textarea[0], caretPos + textStart.length, caretPos + textStart.length);
	}

};

export default {

	config: function (idPrefix) {
		const textarea = $(`#${idPrefix}`);
		const preview = $(`#${idPrefix}-preview`);
		const previewButton = $(`#${idPrefix}-preview-b`);

		const wrapper = textarea.parent();

		// Youtube
		const yt = wrapper.find(".tool-yt");
		yt.click(e => {
			editorInsertText(textarea, "YT[id_de_la_video]", 3, 17);
		});
		yt.tooltip({
			title: "Insérer une balise de vidéo Youtube"
		});

		// Strawpoll
		const straw = wrapper.find(".tool-straw");
		straw.click(() => {
			editorInsertText(textarea, "POLL[id_du_strawpoll]", 5, 20);
		});
		straw.tooltip({
			title: "Insérer une balise de sondage Strawpoll"
		});

		// Bold
		const bold = wrapper.find(".tool-b");
		bold.click(() => {
			editorWrapText(textarea, "**");
		});
		bold.tooltip({
			title: "Mettre en gras"
		});

		// Italic
		const italic = wrapper.find(".tool-i");
		italic.click(() => {
			editorWrapText(textarea, "*");
		});
		italic.tooltip({
			title: "Mettre en souligné"
		});

		// Underline
		const underline = wrapper.find(".tool-u");
		underline.click(() => {
			editorWrapText(textarea, "<u>", "</u>");
		});
		underline.tooltip({
			title: "Mettre en italic"
		});

		// Center
		const center = wrapper.find(".tool-center");
		center.click(() => {
			editorWrapText(textarea, "<center>", "</center>");
		});
		center.tooltip({
			title: "Centrer le texte"
		});

		// Link
		const link = wrapper.find(".tool-link");
		link.click(() => {
			editorWrapText(textarea, "[Texte du lien](", ")", 1, 14);
		});
		link.tooltip({
			title: "Insérer un lien"
		});

		// Image
		const image = wrapper.find(".tool-image");
		image.click(() => {
			editorWrapText(textarea, "![](", ")");
		});
		image.tooltip({
			title: "Insérer un lien d'image"
		});

		// Emoji
		wrapper.find(".emoji").click(e => {
			editorInsertText(textarea, $(e.target).text());
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

		gifsSearch.tooltip({
			title: "Rechercher des GIFs."
		});

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
								gifsSearchModalContainer.append(`<img class="gif-preview" src='https://i.giphy.com/media/${gif.id}/giphy-preview.gif' gif="${gif.id}"/>`);
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
