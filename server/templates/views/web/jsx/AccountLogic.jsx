import * as FetchUtils from "../../../../../public/js/utils/FetchUtils.jsx";

/**
 * Selects configuration
 */

$.fn.select2.defaults.set("theme", "bootstrap");

$('#select-occupation').select2({
	minimumResultsForSearch: Infinity,
	width: '100%'
});
$('#select-jobs').select2({
	placeholder: "Sélectionnez vos métiers",
	allowClear: true,
	width: '100%'
});
$('#select-ships').select2({
	placeholder: "Sélectionnez vos vaisseaux",
	allowClear: true,
	width: '100%'
});

/**
 * Parameters save
 */

let parametersSaveButton = $('#parameters-save-button');
let emailField = $('#parameters-field-email');
let usernameField = $('#parameters-field-username');

parametersSaveButton.click(e => {
	let email = emailField.val();
	let username = usernameField.val();
	let city = $('#parameters-field-city').val();
	let birthday = $('#parameters-field-birthday').val();
	let sign = $('#parameters-field-sign').val();

	/**
	 * Validations
	 */

	let errorBasket = [];
	let atLeastOne = false;
	if (!email) {
		atLeastOne = true;
		emailField.addClass("invalid");
	} else {
		emailField.removeClass("invalid");
	}
	if (!username) {
		atLeastOne = true;
		usernameField.addClass("invalid");
	} else {
		usernameField.removeClass("invalid");
	}

	if (atLeastOne) {
		return;
	}

	/**
	 * Send data
	 */

	let data = {
		email: email,
		username: username,
		city: city,
		birthday: birthday,
		sign: sign,
	};

	parametersSaveButton.prop('disabled', true);
	FetchUtils.post('account', 'parameters', data, {
			success: result => {
				if (result.error) {
					parametersSaveButton.prop('disabled', false);
					parametersSaveButton.notify(result.error, {className: 'error', position: 'left'});
				} else {
					location.reload();
				}
			},
			fail: result => {
				parametersSaveButton.prop('disabled', false);
				$.notify(result, {className: 'error'});
			}
		});
});
