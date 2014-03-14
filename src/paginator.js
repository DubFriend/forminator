var createPaginator = function (fig) {
    var self = {},
        name = fig.name,
        request = fig.request,

        $numberOfPages = $('.frm-number-of-pages-' + name ),
        $numberOfResults = $('.frm-number-of-results-' + name),
        $pageNumbers = $('.frm-page-numbers-' + name),
        $gotoPage = $('.frm-goto-page-' + name),
        $previous = $('.frm-previous-' + name),
        $next = $('.frm-next-' + name),

        visiblePages = (function () {
            pages = [];
            $pageNumbers.find('[data-number]').each(function () {
                pages.push(Number($(this).data('number')));
            });
            return pages;
        }()),

        getDataNumber = function ($el) {
            return $el.is('data-number') ? $el : $el.find('data-number');
        },

        currentPage = Number(getDataNumber(
            $pageNumbers.find('.frm-number-container.selected'
        )).data('number')),

        // note: $itemTemplate should be initialized after visiblePages and
        // currentPage are initialized.
        $itemTemplate = (function () {
            var $el = $pageNumbers
                    .find('.frm-number-container:first-child').clone();
            $el.removeClass('selected');
            getDataNumber($el).html('').data('number', '');
            return $el;
        }());

    return self;
};
