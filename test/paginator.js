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
                this.setPageParameters = data;
            },
            search: function () {
                this.searchIsCalled = true;
            }
        });

        this.errorMessages = {
            noPage: "noPage message",
            notAnInteger: "notAnInteger message",
            nonPositiveNumber: "nonPositiveNumber message"
        };

        this.gotoPage = mixinPubSub({
            validateReturnValue: {},
            validate: function (data, maxPageNumber) {
                this.validateParameters = {
                    data: data, maxPageNumber: maxPageNumber
                };
                return this.validateReturnValue;
            },
            clearFeedback: function () {
                this.clearFeedbackCalled = true;
            },
            setFeedback: function (data) {
                this.setFeedbackParameters = data;
            },
            reset: function () {
                this.resetCalled = true;
            }
        });

        this.paginator = createPaginator({
            name: 'name',
            request: this.request,
            gotoPage: this.gotoPage,
            errorMessages: this.errorMessages
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
    strictEqual(this.request.setPageParameters, 2, 'setPage called with pageNumber');
    ok(this.request.searchIsCalled, 'search is called');
});

test('subscribes to response: 0 pages', function () {
    this.request.publish('success', { numberOfPages: 0 });
    var $containers = this.$pageNumbers.find('.frm-number-container');
    strictEqual($containers.length, 0, '0 pages rendered');
});

test('subscribes to gotoPage submit event success', function () {
    this.gotoPage.publish('submit', { page: '1'});
    ok(this.gotoPage.clearFeedbackCalled, 'form feedback is cleared');
    ok(this.gotoPage.resetCalled, 'form reset');
    strictEqual(this.request.setPageParameters, 1, 'request.setPage');
    ok(this.request.searchIsCalled, 'request.search');
});

test('subscribes to gotoPage submit event error', function () {
    this.gotoPage.validateReturnValue = { page: 'error message' };
    this.gotoPage.publish('submit', { page: '4'});
    ok(!this.gotoPage.clearFeedbackCalled, 'form feedback is not cleared');
    ok(!this.gotoPage.resetCalled, 'form not reset');
    strictEqual(this.request.setPageParameters, undefined, 'request.setPage not called');
    ok(!this.request.searchIsCalled, 'request.search not called');
    deepEqual(
        this.gotoPage.setFeedbackParameters, {
            page: "Page number cannot exceed " +
                  "the total number of pages."
        },
        'set feedback called'
    );
});

test('validate success, max page same as page', function () {
    deepEqual(this.paginator.validate({ page: '5' }, 5), {});
});

test('validate success, max page greater than page', function () {
    deepEqual(this.paginator.validate({ page: '5' }, 6), {});
});

test('validate fail, page greater than max page', function () {
    deepEqual(this.paginator.validate({ page: '5'}, 4), {
        page: "Page number cannot exceed the total number of pages."
    });
});

test('validate fail, page nonPositiveNumber', function () {
    deepEqual(this.paginator.validate({ page: '0'}, 4), {
        page: this.errorMessages.nonPositiveNumber
    });
});

test('validate fail, page notAnInteger', function () {
    deepEqual(this.paginator.validate({ page: 'a'}, 4), {
        page: this.errorMessages.notAnInteger
    });
});

test('validate fail, page noPage', function () {
    deepEqual(this.paginator.validate({}, 4), {
        page: this.errorMessages.noPage
    });
});

test('previous click success', function () {
    this.$previous.click();
    strictEqual(this.request.setPageParameters, 1);
});

test('previous click doesnt go below 1', function () {
    this.$previous.click().click();
    strictEqual(this.request.setPageParameters, 1);
});

test('next click success', function () {
    this.$next.click();
    strictEqual(this.request.setPageParameters, 3);
});

test('next click doesnt go above max page number', function () {
    this.$next.click().click();
    strictEqual(this.request.setPageParameters, 3);
});
