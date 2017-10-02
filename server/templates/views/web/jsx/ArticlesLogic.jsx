(($) => {

	/**
	 * Articles filtres
	 */

	$.fn.select2.defaults.set("theme", "bootstrap");
	
	const authors = $('#articles-filter-author').select2({
		placeholder: "Sélectionnez des auteurs",
		allowClear: true,
		closeOnSelect: false,
		width: '100%'
	});

	const categories = $('#articles-filter-category').select2({
		placeholder: "Sélectionnez des catégories",
		allowClear: true,
		closeOnSelect: false,
		width: '100%'
	});

	const url  = new Url;
	authors.val(url.query.authors ? url.query.authors.split("-") : null).trigger('change');
	categories.val( url.query.categories ? url.query.categories.split("-") : null).trigger('change');
	
	$('#articles-confirm').click(e => {
		
		const authorSelection = authors.val(); 
		const categorySelection = categories.val();

		url.query.authors = authorSelection ? authorSelection.join("-") : null;
		url.query.categories = categorySelection ? categorySelection.join("-") : null;
		
		location.href = url.toString();
	});
	
})(jQuery);
