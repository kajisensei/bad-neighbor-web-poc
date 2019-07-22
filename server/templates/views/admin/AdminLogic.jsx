import * as FetchUtils from "../../../../public/js/utils/FetchUtils.jsx";
import LoadingModal from "../widget/LoadingModal.jsx";

(($) => {

	/**
	 * Pages generiques
	 */

	$("#discord-restart").click(() => {
		const dialog = LoadingModal.show();
		FetchUtils.post('admin', 'restart-discord', {}, {
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
