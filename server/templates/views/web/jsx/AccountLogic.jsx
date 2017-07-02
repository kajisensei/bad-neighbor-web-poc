import * as FetchUtils from "../../../../../public/js/utils/FetchUtils.jsx";

/**
 * Selects configuration
 */

$.fn.select2.defaults.set("theme", "bootstrap");

let jobsSelect = $('#select-jobs').select2({
	placeholder: "Sélectionnez vos métiers",
	allowClear: true,
	width: '100%'
});
let shipsSelect = $('#select-ships').select2({
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
	let avatar = $('#parameters-field-avatar').prop('files')[0];
	FetchUtils.postUpload('account', 'parameters', [avatar], data, {
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

/**
 * Password
 */

let passwordSaveButton = $('#password-save-button');
let passwordField = $('#password-field');
let confirmField = $('#password-confirm');

passwordSaveButton.click(e => {
	let password = passwordField.val();
	let confirm = $('#password-confirm').val();

	/**
	 * Validations
	 */

	let atLeastOne = false;
	if (!password) {
		atLeastOne = true;
		passwordField.addClass("invalid");
	} else {
		passwordField.removeClass("invalid");
	}
	if (!confirm) {
		atLeastOne = true;
		confirmField.addClass("invalid");
	} else {
		confirmField.removeClass("invalid");
	}
	if (password !== confirm) {
		atLeastOne = true;
		passwordSaveButton.notify("Les mots de passe ne sont pas les mêmes", {className: 'error', position: 'left'});
	}

	if (atLeastOne) {
		return;
	}

	let data = {
		password: password,
	};

	passwordSaveButton.prop('disabled', true);
	FetchUtils.post('account', 'password', data, {
		success: result => {
			if (result.error) {
				passwordSaveButton.prop('disabled', false);
				passwordSaveButton.notify(result.error, {className: 'error', position: 'left'});
			} else {
				location.reload();
			}
		},
		fail: result => {
			passwordSaveButton.prop('disabled', false);
			$.notify(result, {className: 'error'});
		}
	});
});

/**
 * SC save
 */

let scSaveButton = $('#sc-save-button');

scSaveButton.click(e => {
	let isSC = $('#sc-field-check').is(':checked');
	let first = $('#sc-field-first').val();
	let last = $('#sc-field-last').val();
	let description = $('#sc-field-description').val();
	
	let data = {
		isSC: isSC,
		first: first,
		last: last,
		description: description,
		jobs: jobsSelect.val(),
		ships: shipsSelect.val()
	};

	scSaveButton.prop('disabled', true);
	FetchUtils.post('account', 'sc', data, {
		success: result => {
			if (result.error) {
				scSaveButton.prop('disabled', false);
				scSaveButton.notify(result.error, {className: 'error', position: 'left'});
			} else {
				location.reload();
			}
		},
		fail: result => {
			scSaveButton.prop('disabled', false);
			$.notify(result, {className: 'error'});
		}
	});
});
