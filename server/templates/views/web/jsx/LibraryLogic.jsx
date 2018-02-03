import * as FetchUtils from "../../../../../public/js/utils/FetchUtils.jsx";
import LoadingModal from "../../widget/LoadingModal.jsx";


(($) => {

	/**
	 * Librarie
	 */

	// Upload
	$('#upload-button').click(() => {

		const data = {
			filename: $('#name-field').val()
		};

		if (!data.filename)
			return $.notify("Veuillez entrer un nom d'image", "error");

		const dialog = LoadingModal.show();
		FetchUtils.postUpload('generic', 'library-add',
			[$('#file-field')[0].files[0]], data, {
				success: result => {
					dialog.modal('hide');
					if (result.error) {
						// Erreur serveur (erreur logique)
						$.notify((result.error.details && result.error.details[0]) || "An error occured (see logs)", 'error');
					} else {
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

	$('.library-remove').click(e => {
		const filename = $(e.target).attr("filename");
		bootbox.confirm(`Supprimer l'image ${filename} ?`, confirm => {
			if (confirm) {
				const dialog = LoadingModal.show();
				FetchUtils.post('generic', 'library-remove', {filename: filename}, {
					success: result => {
						dialog.modal('hide');
						if (result.error) {
							// Erreur serveur (erreur logique)
							$.notify((result.error.details && result.error.details[0]) || "An error occured (see logs)", 'error');
						} else {
							location.reload();
						}
					},
					fail: result => {
						// Erreur
						dialog.modal('hide');
						$.notify(result, {className: 'error'});
					}
				});
			}
		});
	});

	$('#search-button').click(() => {
		const text = $('#search-field').val();
		if (text) {
			location.href = `/library?search=${text}`;
		} else {
			location.href = `/library`;
		}
	});

})(jQuery);
