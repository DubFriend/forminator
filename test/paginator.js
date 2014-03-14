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

        this.paginator = createPaginator({
            name: 'name',
            request: {
                setPage: function (data) {
                    self.setPageParameters = data;
                },
                search: function () {
                    self.searchIsCalled = true;
                }
            }
        });
    }
});

test('fo', function () { ok(true);})