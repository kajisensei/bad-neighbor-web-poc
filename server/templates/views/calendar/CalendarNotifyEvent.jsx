import * as FetchUtils from "../../../../public/js/utils/FetchUtils.jsx";
import LoadingModal from "../widget/LoadingModal.jsx";

(($) => {

	/**
	 * Notify event
	 */
	
	const popup = $('#calendar-event-popup');
	const notifyButton = $('#calendar-event-popup-notify');

	notifyButton.click(() => {
		
		const eventId = popup.attr("eventId");
		popup.modal('hide');
		
		bootbox.confirm("Annoncer cet évènement sur Discord ?<br/>Notez que les invités directs (utilisateurs et groupes) ont déjà reçu une notification personnelle à la création de l'événement ! Une annonce globale n'a de sens que pour un événement publiquement ouvert.", function (result) {
			if (result) {
				const dialog = LoadingModal.show();
				FetchUtils.post('calendar', 'notifyEvent', {eventId: eventId}, {
					success: result => {
						if (result.error) {
							// Erreur serveur (erreur logique)
							$.notify((result.error.details && result.error.details[0]) || "An error occured (see logs)", 'error');
						} else {
							dialog.modal('hide');
							location.href = `/calendar?open=${eventId}`;
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
