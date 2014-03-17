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

        getDataNumber = function ($el) {
            return $el.is('data-number') ? $el : $el.find('data-number');
        },

        page = toInt(getDataNumber(
            $pageNumbers.find('.frm-number-container.selected'
        )).data('number')) || 1,
        numberOfPages = toInt($numberOfPages.html()) || page,
        numberOfResults = toInt($numberOfResults.html()) || null,

        // note: $itemTemplate should be initialized after visiblePages and
        // currentPage are initialized.
        $itemTemplate = (function () {
            var $el = $pageNumbers
                    .find('.frm-number-container:first-child').clone();
            $el.removeClass('selected');
            getDataNumber($el).html('').data('number', '');
            return $el;
        }()),

        setNumberOfPages = function (newNumberOfPages) {
            newNumberOfPages = toInt(newNumberOfPages);
            if(newNumberOfPages !== numberOfPages) {
                $numberOfPages.html(newNumberOfPages);
                numberOfPages = newNumberOfPages;
            }
        },

        setNumberOfResults = function (newNumberOfResults) {
            newNumberOfResults = toInt(newNumberOfResults);
            if(newNumberOfResults !== numberOfResults) {
                $numberOfResults.html(newNumberOfResults);
                numberOfResults = newNumberOfResults;
            }
        },

        calculatePagesToRender = function () {
            var pages = range(page - 3, page + 3);

            var rollOver = function (array) {
                array.shift();
                array.push(last(array) + 1);
                return array;
            };

            while(pages[0] < 1) {
                pages = rollOver(pages);
            }

            while(!isEmpty(pages) && last(pages) > numberOfPages) {
                pages.pop();
            }

            return pages;
        },

        createPageItem = function (fig) {
            var self = {},
                $self = fig.$,
                $number = $self.find('[data-number]'),
                pageNumber = fig.pageNumber || toInt($number.data('number'));

            self.set = function (newPageNumber) {
                newPageNumber = toInt(newPageNumber);
                if(pageNumber !== newPageNumber) {
                    $number.html(newPageNumber);
                    pageNumber = newPageNumber;
                }
            };

            self.get = function () {
                return pageNumber;
            };

            self.setSelected = function () {
                $self.addClass('selected');
            };

            self.clearSelected = function () {
                $self.removeClass('selected');
            };

            self.destroy = function () {
                $self.remove();
            };

            $number.html(pageNumber);

            $self.click(function () {
                page = pageNumber;
                request.setPage(pageNumber);
                request.search();
            });

            return self;
        },

        pages = (function () {
            pages = [];
            $pageNumbers.find('.frm-number-container').each(function () {
                pages.push(createPageItem({
                    $: $(this)
                }));
            });
            return pages;
        }()),

        getPageObjectWithPageNumber = function (pageNumber) {
            var itemsArray = filter(pages, function (pageObject) {
                return pageObject.get() === pageNumber;
            });
            return isEmpty(itemsArray) ? null : itemsArray[0];
        },

        updatePages = function () {
            var i = 0;
            foreach(calculatePagesToRender(), function (pageNumber) {
                if(pages[i]) {
                    pages[i].set(pageNumber);
                }
                else {
                    var $item = $itemTemplate.clone();
                    $pageNumbers.append($item);
                    pages[i] = createPageItem({
                        pageNumber: pageNumber,
                        $: $item
                    });
                }
                i += 1;
            });
            // remove excess pages
            while(pages[i]) {
                pages[i].destroy();
                pages.splice(i, 1);
            }
        };

    request.subscribe('success', function (response) {
        if(toInt(response.numberOfPages) === 0 || response.numberOfPages) {
            setNumberOfPages(response.numberOfPages);
        }
        if(response.numberOfResults) {
            setNumberOfResults(response.numberOfResults);
        }
        updatePages();
        call(pages, 'clearSelected');
        var selectedPage = getPageObjectWithPageNumber(page);
        if(selectedPage) {
            selectedPage.setSelected();
        }
    });

    return self;
};
