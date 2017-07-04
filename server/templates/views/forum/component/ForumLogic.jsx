import ForumTopicArticle from "./ForumTopicArticle.jsx";
import ForumTopicRemove from "./ForumTopicRemove.jsx";
import ForumTopicSelection from "./ForumTopicSelection.jsx";

/**
 * Switch button
 */

$('.switch-button').click(function() {
	let button = $(this);
	let id = button.attr("forId");
	$('#original-' + id).toggle();
	$('#content-' + id).toggle();
});
