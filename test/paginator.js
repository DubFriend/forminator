module("paginator", {
    setup: function () {
        $('#qunit-fixture').html($('#forminator').html());
        var self = this;

        this.$numberOfPages = $('.frm-number-of-pages-name');
        this.$numberOfResults = $('.frm-number-of-results-name');
        this.$pageNumbers = $('.frm-page-numbers-name');
        this.$gotoPage = $('.frm-goto-page-name');
        this.$previous = $('.frm-previous-name');
        this.$next = $('.frm-next-name');

        this.request = mixinPubSub({
            setPage: function (data) {
                self.setPageParameters = data;
            },
            search: function () {
                self.searchIsCalled = true;
            }
        });

        this.paginator = createPaginator({
            name: 'name',
            request: this.request
        });
    }
});

test('subscribes to response success: set number of pages', function () {
    this.request.publish('success', { numberOfPages: 5 });
    strictEqual(this.$numberOfPages.html(), '5');
});

test('subscribes to response success: set number of results', function () {
    this.request.publish('success', { numberOfResults: 50 });
    strictEqual(this.$numberOfResults.html(), '50');
});

test('subscribes to response: updates pages restricted', function () {
    this.request.publish('success', { numberOfPages: 3 });
    var $containers = this.$pageNumbers.find('.frm-number-container');
    strictEqual($containers.length, 3, '3 pages rendered');
    var pages = ['1', '2', '3'];
    $containers.each(function (index) {
        strictEqual($(this).find('[data-number]').html(), pages[index]);
    });
});

test('subscribes to response: updates pages restricted to 7 pages max', function () {
    this.request.publish('success', { numberOfPages: 8 });
    var $containers = this.$pageNumbers.find('.frm-number-container');
    strictEqual($containers.length, 7, '7 pages rendered');
    var pages = ['1', '2', '3', '4', '5', '6', '7'];
    $containers.each(function (index) {
        strictEqual($(this).find('[data-number]').html(), pages[index]);
    });
});

test('click page calls request', function () {
    this.$pageNumbers.find('.frm-number-container:first-child').click();
    strictEqual(this.setPageParameters, 1, 'setPage called with pageNumber');
    ok(this.searchIsCalled, 'search is called');
});

test('subscribes to response: 0 pages', function () {
    this.request.publish('success', { numberOfPages: 0 });
    var $containers = this.$pageNumbers.find('.frm-number-container');
    strictEqual($containers.length, 0, '0 pages rendered');
});
