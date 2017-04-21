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
scheduler.parse(scheduler.bn_content, "json");

