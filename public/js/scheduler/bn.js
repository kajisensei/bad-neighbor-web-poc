/**
 * Created by Syl on 21-04-17.
 */

scheduler.config.readonly = false;
scheduler.config.readonly_form = true;
scheduler.config.drag_create = false;
scheduler.config.drag_in = false;
scheduler.config.drag_move = false;
scheduler.config.drag_out = false;
scheduler.config.drag_resize= false;
scheduler.config.dblclick_create = false;
scheduler.config.icons_select = ['icon_details'];
scheduler.init('bn_scheduler', new Date(), "month");

let events = [
	{id: 1, text: "Meeting", start_date: "04/21/2017 14:00", end_date: "04/21/2017 17:00"},
	{id: 2, text: "Conference", start_date: "04/21/2017 12:00", end_date: "04/22/2017 19:00"},
	{id: 3, text: "Interview", start_date: "04/22/2017 09:00", end_date: "04/22/2017 10:00"}
];

scheduler.parse(events, "json");

