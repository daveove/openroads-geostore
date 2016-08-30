// ALL DASHBOARD ITEM EVENTS ARE STORED HERE

$('textarea[name="data-collectors"]').on('keyup', function() {
	$(this).val().length > 0 ? $('.dropzone-container').slideDown() : $('.dropzone-container').slideUp();
});

$('input[name="code"], input[name="name"], input[name="title"]').on('keyup', function() {
	$(this).val().length > 0 ? $('input[type="submit"]').removeAttr('disabled') : $('input[type="submit"]').attr('disabled', '');
});