import * as FetchUtils from "../../../../public/js/utils/FetchUtils.jsx";
import LoadingModal from "../widget/LoadingModal.jsx";

(($) => {

	/**
	 * Delete event
	 */
	
	const popup = $('#calendar-event-popup');
	const deleteButton = $('#calendar-event-popup-delete');

	deleteButton.click(() => {
		
		const eventId = popup.attr("eventId");
		popup.modal('hide');
		
		bootbox.confirm("Supprimer cet évènement ?<br/>Les inscrits recevront une notification d'annulation.", function (result) {
			if (result) {
				const dialog = LoadingModal.show();
				FetchUtils.post('calendar', 'removeEvent', {eventId: eventId}, {
					success: result => {
						if (result.error) {
							// Erreur serveur (erreur logique)
							$.notify((result.error.details && result.error.details[0]) || "An error occured (see logs)", 'error');
						} else {
							dialog.modal('hide');
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
	
})(jQuery);
