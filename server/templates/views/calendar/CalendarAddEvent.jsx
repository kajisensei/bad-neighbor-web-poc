import * as FetchUtils from "../../../../public/js/utils/FetchUtils.jsx";
import LoadingModal from "../widget/LoadingModal.jsx";
import markdownEditor from "../widget/markdown_editor.jsx";

$.fn.select2.defaults.set("theme", "bootstrap");

const inviteUsers = $('#calendar-create-invite-users').select2({
	placeholder: "Utilisateurs",
	allowClear: true,
	closeOnSelect: false,
	width: '100%'
});

const inviteGroups = $('#calendar-create-invite-groups').select2({
	placeholder: "Groupes",
	allowClear: true,
	closeOnSelect: false,
	width: '100%'
});

const description = markdownEditor.config("calendar-create-description");

$("#calendar-create-modal-button").click(() => {

	const popup = $('#calendar-create-modal');
	const startDate = $('#calendar-create-start-date');
	const endDate = $('#calendar-create-end-date');
	const title = $('#calendar-create-title');
	const publicField = $("#calendar-create-public");
	// const open = $("#calendar-create-open");
	// const discord = $("#calendar-create-discord");

	const data = {
		startDate: startDate.data("DateTimePicker").date(),
		endDate: endDate.data("DateTimePicker").date(),
		title: title.val(),
		description: description.val(),
		public: publicField.prop("checked"),
		// open: open.prop("checked"),
		// discord: discord.prop("checked"),
		users: inviteUsers.val(),
		groups: inviteGroups.val()
	};

	if (!data.title)
		return $.notify("Veuillez entrer un titre", "error");

	const dialog = LoadingModal.show();
	popup.modal('hide');
	FetchUtils.post('calendar', 'addEvent', data, {
		success: result => {
			if (result.error) {
				// Erreur serveur (erreur logique)
				$.notify((result.error.details && result.error.details[0]) || "An error occured (see logs)", 'error');
			} else {
				dialog.modal('hide');
				location.href = "/calendar";
			}
		},
		fail: result => {
			// Erreur
			dialog.modal('hide');
			$.notify(result, {className: 'error'});
		}
	});

});

export default {

	openPopup: function (date) {

		let today = moment(date);

		const popup = $('#calendar-create-modal');
		const startDate = $('#calendar-create-start-date');
		const endDate = $('#calendar-create-end-date');
		const options = {
			locale: 'fr',
			showTodayButton: true,
			widgetPositioning: {
				horizontal: 'right'
			}
		};

		startDate.datetimepicker(options);
		today.set('hour', 21);
		startDate.data("DateTimePicker").date(today);

		endDate.datetimepicker(options);
		today.set('hour', 23);
		endDate.data("DateTimePicker").date(today);

		popup.modal('show');

	}

}
