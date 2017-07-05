
const show = function() {
	return bootbox.dialog({
		message: '<p class="text-center">Veuillez patienter ...</p>',
		closeButton: false
	});
};

export default {

	show: show,
	
}
