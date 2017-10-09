import * as FetchUtils from "../../../../../public/js/utils/FetchUtils.jsx";
import LoadingModal from "../../widget/LoadingModal.jsx";

/**
 * Remove topic
 */

$('#topic-lock-button').click(function (e) {
	e.preventDefault();
	
	let button = $(this);
	
	let topicKey = button.attr("topicKey");

	const dialog = LoadingModal.show();

	const data = {
		topicKey: topicKey
	};
	FetchUtils.post('topic', 'lock', data, {
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

});
