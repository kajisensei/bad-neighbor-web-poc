import AddEvent from "./CalendarAddEvent.jsx";
import "./CalendarDeleteEvent.jsx";
import "./CalendarNotifyEvent.jsx";
import LoadingModal from "../widget/LoadingModal.jsx";
import * as FetchUtils from "../../../../public/js/utils/FetchUtils.jsx";

(($) => {

	let getEntryById = id => {
		let found;
		scheduler.bn_content.forEach(entry => {
			if (entry.id === id) {
				found = entry;
			}
		});
		return found;
	};

	let getEntryByRealId = id => {
		let found;
		scheduler.bn_content.forEach(entry => {
			if (entry.real_id === id) {
				found = entry;
			}
		});
		return found;
	};

	/*
	 * Show entry
	 */

	const detailModal = $('#calendar-event-popup');
	const detailModalBody = $('#calendar-event-popup-body');
	const detailModalTitle = $('#calendar-event-popup-title');
	const deleteButton = $('#calendar-event-popup-delete');
	const editButton = $('#calendar-event-popup-edit');
	const statutButton = $('#calendar-event-popup-statut');
	const notifyButton = $('#calendar-event-popup-notify');

	statutButton.find('.action').click(e => {
		const actionType = $(e.target).attr("actionType");
		const eventId = detailModal.attr("eventId");
		const dialog = LoadingModal.show();
		FetchUtils.post('calendar', 'statut', {eventId: eventId, actionType: actionType}, {
			success: result => {
				if (result.error) {
					// Erreur serveur (erreur logique)
					$.notify((result.error.details && result.error.details[0]) || "An error occured (see logs)", 'error');
				} else {
					dialog.modal('hide');
					location.href = `/calendar?open=${eventId}`;
				}
			},
			fail: result => {
				// Erreur
				dialog.modal('hide');
				$.notify(result, {className: 'error'});
			}
		});
	});

	let showEntry = entry => {
		if (entry && entry.real_id) {
			detailModalTitle.html(`<a href="/calendar?open=${entry.real_id}">${entry.text}</a>`);
			detailModalBody.html(entry.html);
			detailModal.attr("eventId", entry.real_id);
			detailModal.attr("event_id", entry.id);

			if (entry.mine || userRights.indexOf("calendar-admin") !== -1) {
				deleteButton.show();
				editButton.show();
				notifyButton.show();
			} else {
				deleteButton.hide();
				editButton.hide();
				notifyButton.hide();
			}
			detailModal.modal('show');
		}
	};

	/*
	 * Edit entry
	 */

	editButton.click(() => {
		detailModal.edit = true;
		detailModal.modal('hide');
	});

	detailModal.on("hidden.bs.modal", () => {
		if (detailModal.edit) {
			detailModal.edit = false;
			const event_id = detailModal.attr("event_id");
			if (event_id && Number(event_id) !== undefined) {
				let entry = getEntryById(Number(event_id));
				if (entry && entry.real_id) {
					AddEvent.editPopup(entry);
				}
			}
		}
	});


	/*
	 * Scheduler config
	 */

	const url = new Url;

	scheduler.config.readonly = true;
	scheduler.config.readonly_form = true;
	scheduler.config.drag_create = false;
	scheduler.config.drag_in = false;
	scheduler.config.drag_move = false;
	scheduler.config.drag_out = false;
	scheduler.config.drag_resize = false;

	// Visual
	scheduler.templates.event_class = function (start, end, event) {
		const styles = [];
		if (event.dbEntry && event.dbEntry.public) {
			styles.push("public");
		}
		if (event.dbEntry && event.dbEntry.open) {
			styles.push("open");
		}
		if (event.isBirthday) {
			styles.push("birthday");
		}
		return styles.join(" ");
	};
	scheduler.attachEvent("onTemplatesReady", function () {
		scheduler.templates.event_bar_date = function (start, end, event) {
			return "<b>" + scheduler.templates.event_date(start) + "</b> ";
		};
	});

	// Tooltip
	dhtmlXTooltip.config.className = 'dhtmlXTooltip tooltip';
	const format = scheduler.date.date_to_str("%Y-%m-%d %H:%i");
	scheduler.templates.tooltip_text = function (start, end, event) {
		if (event.tooltip) {
			return `${event.tooltip}`;
		}
		if (event.isBirthday) {
			const age = moment(start).diff(moment(event.isBirthday), 'years');
			return `<b>Anniversaire de ${event.text}. ${age + 1 } ans !</b>`;
		}
		return "<b>Événement:</b> " + event.text + "<br/><b>Début :</b> " +
			format(start) + "<br/><b>Fin :</b> " + format(end);
	};

	// scheduler.config.max_month_events = 3;
	scheduler.init('bn_scheduler', new Date(), url.query.toAgenda ? "agenda" : "month");
	scheduler.parse(scheduler.bn_content, "json");
	scheduler.attachEvent("onClick", function (id, e) {
		if (e.target) {
			const target = $(e.target);
			const event_id = target.attr('event_id') || $(target.parent()).attr('event_id');
			if (event_id && Number(event_id)) {
				let entry = getEntryById(Number(event_id));
				showEntry(entry);
			}
		}
		return false;
	});

	/*
	 * Add entry
	 */

	if (!url.query.toAgenda) {
		if (userRights.indexOf("calendar") !== -1 || userRights.indexOf("calendar-admin") !== -1) {
			scheduler.attachEvent("onEmptyClick", function (date, e) {
				AddEvent.openPopup(date);
			});
		}
	}

	/**
	 * Open event in url
	 */

	if (url.query["open"]) {
		const openId = url.query["open"];
		let entry = getEntryByRealId(openId);
		if (entry) {
			showEntry(entry);
		} else {
			bootbox.alert("Événement introuvable.");
		}
	}


})(jQuery);

window.show_minical = function () {
	if (scheduler.isCalendarVisible()) {
		scheduler.destroyCalendar();
	} else {
		scheduler.renderCalendar({
			position: "dhx_minical_icon",
			date: scheduler._date,
			navigation: true,
			handler: function (date, calendar) {
				scheduler.setCurrentView(date);
				scheduler.destroyCalendar()
			}
		});
	}
};
