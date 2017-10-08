import * as FetchUtils from "../../../../../public/js/utils/FetchUtils.jsx";
import LoadingModal from "../../widget/LoadingModal.jsx";

(($) => {

	/**
	 * Inscription
	 */

	const modal = $('#auth-register-modal');
	const usernameField = $('#auth-register-modal-username');
	const emailField = $('#auth-register-modal-email');
	const emailConfirmField = $('#auth-register-modal-email-confirm');
	const passwordField = $('#auth-register-modal-password');
	const passwordConfirmField = $('#auth-register-modal-password-confirm');


	$('#auth-register-modal-confirm').click(e => {

		const username = usernameField.val();
		const email = emailField.val();
		const emailConfirm = emailConfirmField.val();
		const password = passwordField.val();
		const passwordConfirm = passwordConfirmField.val();

		let atLeastOne = false;
		if (!emailConfirm) {
			atLeastOne = true;
			emailConfirmField.addClass("invalid");
		} else {
			emailConfirmField.removeClass("invalid");
		}
		if (!email) {
			atLeastOne = true;
			emailField.addClass("invalid");
		} else {
			emailField.removeClass("invalid");
		}
		if (email !== emailConfirm) {
			atLeastOne = true;
			emailConfirmField.notify("Les adresses mail ne sont pas les mêmes", {className: 'error', position: 'left'});
		}
		if (!username) {
			atLeastOne = true;
			usernameField.addClass("invalid");
		} else {
			usernameField.removeClass("invalid");
		}
		if (!password) {
			atLeastOne = true;
			passwordField.addClass("invalid");
		} else {
			passwordField.removeClass("invalid");
		}
		if (!passwordConfirm) {
			atLeastOne = true;
			passwordConfirmField.addClass("invalid");
		} else {
			passwordConfirmField.removeClass("invalid");
		}
		if (password !== passwordConfirm) {
			atLeastOne = true;
			passwordConfirmField.notify("Les mots de passe ne sont pas les mêmes", {
				className: 'error',
				position: 'left'
			});
		}

		if (atLeastOne) {
			return;
		}

		const data = {
			username: username,
			email: email,
			emailConfirm: emailConfirm,
			password: password,
			passwordConfirm: passwordConfirm
		};

		const dialog = LoadingModal.show();
		FetchUtils.post('account', 'create', data, {
			success: result => {
				dialog.modal('hide');
				if (result.error) {
					$.notify(result.error, {className: 'error', position: 'top'});
				} else {
					location.href = "/account";
				}
			},
			fail: result => {
				dialog.modal('hide');
				$.notify(result, {className: 'error'});
			}
		});

	});

})(jQuery);
