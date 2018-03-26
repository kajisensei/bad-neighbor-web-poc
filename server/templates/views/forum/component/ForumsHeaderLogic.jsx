import * as FetchUtils from "../../../../../public/js/utils/FetchUtils.jsx";
import LoadingModal from "../../widget/LoadingModal.jsx";

(() => {

	/*
	 * Mark all read
	 */

	$('#forums-marks-all-read').click(e => {

		const dialog = LoadingModal.show();
		FetchUtils.post('forums', 'mark-all-read', {}, {
				success: result => {
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
	
	/*
	 * Mark all read (forum)
	 */
	
	$('#forum-mark-all-read').click(e => {
		const forumId = $(e.target).attr("forum");
		const dialog = LoadingModal.show();
		FetchUtils.post('forums', 'forum-mark-all-read', {forumId : forumId}, {
			success: result => {
				if (result.error) {
					// Erreur serveur (erreur logique)
					dialog.modal('hide');
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

})(jQuery);
