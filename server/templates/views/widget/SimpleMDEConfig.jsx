import * as FetchUtils from "../../../../public/js/utils/FetchUtils.jsx";

export default {

	config: function (element) {
		return new SimpleMDE({
			autoDownloadFontAwesome: false,
			element: element,
			hideIcons: ["fullscreen", "side-by-side"],
			spellChecker: false,
			renderingConfig: {
				singleLineBreaks: true,
			},
			previewRender: function (plainText, preview) { // Async method

				FetchUtils.post('post', 'preview', {raw: plainText}, {
					success: result => {
						if (result.error) {
							$.notify(result.error, {className: 'error', position: 'top'});
						} else {
							preview.innerHTML = result.markdown;
						}
					},
					fail: result => {
						$.notify(result, {className: 'error'});
					}
				});

				return "Loading...";
			},
		});
	}

}
