import * as FetchUtils from "../../../../public/js/utils/FetchUtils.jsx";
import LoadingModal from "../widget/LoadingModal.jsx";

(($) => {

	/**
	 * Notify event
	 */
	
	const popup = $('#calendar-event-popup');
	const notifyButton = $('#calendar-event-popup-pm');

	notifyButton.click(() => {
		
		const eventId = popup.attr("eventId");
		popup.modal('hide');
		
		bootbox.prompt("Envoyer un message aux inscrits.", function (result) {
			if (result) {
				const dialog = LoadingModal.show();
				FetchUtils.post('calendar', 'pmEvent', {eventId: eventId, message: result}, {
					success: result => {
						if (result.error) {
							// Erreur serveur (erreur logique)
							$.notify((result.error.details && result.error.details[0]) || "An error occured (see logs)", 'error');
						} else {
							dialog.modal('hide');
							location.href = "/calendar";
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
	
})(jQuery);
