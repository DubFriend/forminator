var getListItemsData = function ($el) {
    var data = {};
    $el.find('[data-field]').each(function () {
        var value = $(this).html();
        if(value) {
            data[$(this).data('field')] = value;
        }
    });
    return data;
};