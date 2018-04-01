import * as FetchUtils from "../../../../../public/js/utils/FetchUtils.jsx";
import LoadingModal from "../../widget/LoadingModal.jsx";

/**
 * Shout topic to Discord
 */

$('#topic-shout-button').click(function (e) {
	e.preventDefault();
	
	let button = $(this);
	
	let topicKey = button.attr("topicKey");
	
	bootbox.confirm("Annoncer ce sujet sur Discord ?", confirm => {
		if(confirm) {
			const dialog = LoadingModal.show();

			const data = {
				topicKey: topicKey
			};
			FetchUtils.post('topic', 'shout', data, {
				success: result => {
					dialog.modal('hide');
					if (result.error) {
						$.notify(result.error, {className: 'error'});
					} else {
						$.notify("Sujet annoncé sur Discord.", {className: 'success'});
					}
				},
				fail: result => {
					dialog.modal('hide');
					$.notify(result, {className: 'error'});
				}
			});
		}
	});

});
