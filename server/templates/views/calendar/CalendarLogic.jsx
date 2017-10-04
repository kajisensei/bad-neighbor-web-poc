import AddEvent from "./CalendarAddEvent.jsx";
import DeleteEvent from "./CalendarDeleteEvent.jsx";

let getEntryById = id => {
	let found;
	scheduler.bn_content.forEach(entry => {
		if(entry.id === id){
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

let showEntry = event_id => {
	let entry = getEntryById(event_id);
	detailModalTitle.text(entry.text);
	detailModalBody.html(entry.html);
	detailModal.attr("eventId", entry.real_id);
	detailModal.modal('show');
};

/*
 * Add entry
 */



/*
 * Scheduler config
 */

const url  = new Url;

scheduler.config.readonly = true;
scheduler.config.readonly_form = true;
scheduler.config.drag_create = false;
scheduler.config.drag_in = false;
scheduler.config.drag_move = false;
scheduler.config.drag_out = false;
scheduler.config.drag_resize= false;
scheduler.config.icons_select = ['icon_details'];
scheduler.init('bn_scheduler', new Date(), url.query.toAgenda ? "agenda" : "month");
scheduler.parse(scheduler.bn_content, "json");
scheduler.attachEvent("onClick", function (id, e){
	if(e.target) {
		const target = $( e.target );
		const event_id = target.attr('event_id');
		if(event_id && Number(event_id)){
			showEntry(Number(event_id));
		}
	}
	return false;
});

scheduler.attachEvent("onEmptyClick", function (date, e){
	AddEvent.openPopup(date);
});
