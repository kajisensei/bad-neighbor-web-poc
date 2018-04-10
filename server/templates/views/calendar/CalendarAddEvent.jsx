import * as FetchUtils from "../../../../public/js/utils/FetchUtils.jsx";
import LoadingModal from "../widget/LoadingModal.jsx";
import markdownEditor from "../widget/markdown_editor.jsx";

let openPopup;
let editPopup;
let currentEditEntry;

(($) => {

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
	const popup = $('#calendar-create-modal');
	const startDate = $('#calendar-create-start-date');
	const endDate = $('#calendar-create-end-date');
	const title = $('#calendar-create-title');
	const publicField = $("#calendar-create-public");
	const modalTitle = $('#add-edit-title');
// const open = $("#calendar-create-open");
	const discord = $("#calendar-create-discord");
	const notification = $("#calendar-notification");

	$("#calendar-create-modal-button").click(() => {

		const data = {
			startDate: startDate.data("DateTimePicker").date(),
			endDate: endDate.data("DateTimePicker").date(),
			title: title.val(),
			description: description.val(),
			public: publicField.prop("checked"),
			// open: open.prop("checked"),
			discord: discord.prop("checked"),
			notification: notification.prop("checked"),
			users: inviteUsers.val(),
			groups: inviteGroups.val()
		};

		if (!data.title)
			return $.notify("Veuillez entrer un titre.", "error");

		if (!data.startDate || !data.endDate)
			return $.notify("Veuillez entrer les dates de début et de fin.", "error");

		if (!data.startDate.isBefore(data.endDate))
			return $.notify("La date de début est avant celle de fin, trou de balle.", "error");

		let action = "addEvent";
		if (popup.attr("editMode") === "true") {
			action = "editEvent";
			data.id = currentEditEntry._id;
		}

		const dialog = LoadingModal.show();
		popup.modal('hide');
		FetchUtils.post('calendar', action, data, {
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

	const options = {
		locale: 'fr',
		showTodayButton: true,
		widgetPositioning: {
			horizontal: 'right'
		}
	};

	openPopup = (date) => {

		let today = moment(date);

		title.val("Nouvel événement");
		description.val("Description de l'événement");
		startDate.datetimepicker(options);
		today.set('hour', 21);
		startDate.data("DateTimePicker").date(today);
		endDate.datetimepicker(options);
		today.set('hour', 23);
		endDate.data("DateTimePicker").date(today);
		publicField.prop("checked", false);
		discord.prop("checked", false);
		notification.prop("checked", true);

		modalTitle.text("Nouvel événement");
		popup.attr("editMode", "false");
		popup.modal('show');

	};

	editPopup = (entry) => {

		currentEditEntry = entry.dbEntry;

		title.val(entry.dbEntry.title);
		description.val(entry.dbEntry.text);
		startDate.datetimepicker(options);
		startDate.data("DateTimePicker").date(moment(entry.dbEntry.startDate));
		endDate.datetimepicker(options);
		endDate.data("DateTimePicker").date(moment(entry.dbEntry.endDate));
		publicField.prop("checked", entry.dbEntry.public);
		discord.prop("checked", entry.dbEntry.discord);
		notification.prop("checked", entry.dbEntry.notification);

		const userIds = entry.dbEntry.invitations.map(e => e._id);
		inviteUsers.val(userIds);
		inviteUsers.trigger('change');

		const groupsIds = entry.dbEntry.groups.map(e => e._id);
		inviteGroups.val(groupsIds);
		inviteGroups.trigger('change');

		modalTitle.text("Modifier événement");
		popup.attr("editMode", "true");
		popup.modal('show');
	};

})(jQuery);

export default {
	openPopup: openPopup,
	editPopup: editPopup
}
