import * as FetchUtils from "../../../../../public/js/utils/FetchUtils.jsx";
import LoadingModal from "../../widget/LoadingModal.jsx";

/**
 * Remove topic
 */

$('.remove-button').click(function (e) {
	e.preventDefault();
	
	let button = $(this);

	let topicId = button.attr("topicId");
	let topicKey = button.attr("topicKey");
	let forumKey = button.attr("forumKey");
	let messageId = button.attr("messageId");

	if (topicId) {
		
		bootbox.confirm("Supprimer ce sujet ?<br/>Tous les messages seront aussi supprimés.", result => {
			if (result) {
				const dialog = LoadingModal.show();
				
				const data = {
					id: topicId,
					topicKey: topicKey
				};
				FetchUtils.post('topic', 'remove', data, {
					success: result => {
						dialog.modal('hide');
						if (result.error) {
							$.notify(result.error, {className: 'error'});
						} else {
							location.href = "/forum/" + forumKey;
						}
					},
					fail: result => {
						dialog.modal('hide');
						$.notify(result, {className: 'error'});
					}
				});
				
			}
		});
	} else if (messageId) {
		bootbox.confirm("Supprimer ce message ?", result => {
			if (result) {
				const dialog = LoadingModal.show();

				const data = {
					id: messageId
				};
				FetchUtils.post('post', 'remove', data, {
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
