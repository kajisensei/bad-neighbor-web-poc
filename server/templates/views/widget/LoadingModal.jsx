export default {

	show: function () {
		return bootbox.dialog({
			message: '<p class="text-center">Please wait ...</p>',
			closeButton: false
		});
	}

}
