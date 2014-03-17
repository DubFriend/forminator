var createPaginator = function (fig) {
    var self = {},
        name = fig.name,
        request = fig.request,
        gotoPage = fig.gotoPage,

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

            while(pages[0] < 1) {
                pages.shift();
                pages.push(last(pages) + 1);
            }

            while(!isEmpty(pages) && last(pages) > numberOfPages) {
                pages.pop();
            }

            return pages;
        },

        setPage = function (pageNumber) {
            page = pageNumber;
            request.setPage(pageNumber);
            request.search();
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
                setPage(pageNumber);
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

        setSelectedPage = function () {
            call(pages, 'clearSelected');
            var selectedPage = getPageObjectWithPageNumber(page);
            if(selectedPage) {
                selectedPage.setSelected();
            }
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

            setSelectedPage();
        };

    request.subscribe('success', function (response) {
        if(toInt(response.numberOfPages) === 0 || response.numberOfPages) {
            setNumberOfPages(response.numberOfPages);
        }
        if(response.numberOfResults) {
            setNumberOfResults(response.numberOfResults);
        }
        updatePages();
    });

    if(gotoPage) {
        gotoPage.subscribe('submit', function (data) {
            var error = gotoPage.validate(data, numberOfPages);
            if(isEmpty(error)) {
                gotoPage.clearFeedback();
                gotoPage.reset();
                setPage(toInt(data.page));
            }
            else {
                gotoPage.setFeedback(error);
            }
        });
    }


    return self;
};
