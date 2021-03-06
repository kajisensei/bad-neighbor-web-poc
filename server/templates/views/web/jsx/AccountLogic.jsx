import * as FetchUtils from "../../../../../public/js/utils/FetchUtils.jsx";
import markdownEditor from "../../widget/markdown_editor.jsx";

/**
 * Selects configuration
 */

$.fn.select2.defaults.set("theme", "bootstrap");

let jobsSelect = $('#select-jobs').select2({
	placeholder: "Sélectionnez vos expertises",
	allowClear: true,
	maximumSelectionLength: 3,
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
let birthdayField = $('#parameters-field-birthday');

const mdeSign = markdownEditor.config("parameters-field-sign");

const options = {
	locale: 'fr',
	format: 'DD/MM/YYYY',
	widgetPositioning: {
		horizontal: 'right'
	}
};
birthdayField.datetimepicker(options);
birthdayField.data("DateTimePicker");

parametersSaveButton.click(e => {
	let email = emailField.val();
	let username = usernameField.val();
	let city = $('#parameters-field-city').val();
	let sign = mdeSign.val();
	let birthday = birthdayField.data("DateTimePicker").date();
	if (birthday)
		birthday.hour(12);

	let discord = $('#parameters-field-discord').val();
	let bnet = $('#parameters-field-bnet').val();
	let origin = $('#parameters-field-origin').val();
	let uplay = $('#parameters-field-uplay').val();
	let steam = $('#parameters-field-steam').val();

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

	if (birthday) {
		const age = moment().diff(birthday, 'years');
		if (age < 14) {
			atLeastOne = true;
			birthdayField.addClass("invalid");
			birthdayField.notify("T'es trop jeune.", {className: 'error', position: 'left'});
		} else {
			birthdayField.removeClass("invalid");
		}
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
		sign: sign,
		bnet: bnet,
		origin: origin,
		uplay: uplay,
		discord: discord,
		steam: steam
	};
	if (birthday)
		data.birthday = birthday;

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
const bgSign = markdownEditor.config("sc-field-description");

scSaveButton.click(e => {
	let isSC = $('#sc-field-check').is(':checked');
	let first = $('#sc-field-first').val();
	let last = $('#sc-field-last').val();
	let description = bgSign.val();
	let handle = $('#sc-field-handle').val();

	let data = {
		isSC: isSC,
		first: first,
		last: last,
		description: description,
		jobs: jobsSelect.val(),
		ships: shipsSelect.val(),
		handle: handle
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
