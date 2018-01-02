import * as FetchUtils from "../../../../../public/js/utils/FetchUtils.jsx";
import LoadingModal from "../../widget/LoadingModal.jsx";

/**
 * Unpublish topic
 */

$('#topic-unpublish-button').click(function (e) {
	e.preventDefault();
	
	let button = $(this);
	let topicKey = button.attr("topicKey");

	if (topicKey) {
		bootbox.confirm("Dépublier ce sujet ?<br/>Cela retirera l'article et/ou la sélection 'En direct du forum' pour ce sujet, mais ne supprimera pas le sujet du forum.", result => {
			if (result) {
				const dialog = LoadingModal.show();
				
				const data = {
					topicKey: topicKey
				};
				FetchUtils.post('topic', 'unpublish', data, {
					success: result => {
						dialog.modal('hide');
						if (result.error) {
							$.notify(result.error, {className: 'error'});
						} else {
							location.reload();
						}
					},
					fail: result => {
						dialog.modal('hide');
						$.notify(result, {className: 'error'});
					}
				});
				
			}
		});
	}

});
