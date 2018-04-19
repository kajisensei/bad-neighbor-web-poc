import * as FetchUtils from "../../../../../public/js/utils/FetchUtils.jsx";

(($) => {
	
	const ban = (b, uid) => {
		FetchUtils.post('account', 'ban', {ban: b, id: uid}, {
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
	};

	$('#admin-ban-button').click(e => {
		ban(true, $(e.target).attr("uid"));
	});
	$('#admin-unban-button').click(e => {
		ban(false, $(e.target).attr("uid"));
	});

	const moderate = (b, uid) => {
		FetchUtils.post('account', 'moderate', {moderated: b, id: uid}, {
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
	};

	$('#admin-moderate-button').click(e => {
		moderate(true, $(e.target).attr("uid"));
	});
	$('#admin-unmoderate-button').click(e => {
		moderate(false, $(e.target).attr("uid"));
	});

})(jQuery);
