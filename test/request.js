module("request", {
    setup: function () {
        var self = this;
        self.request = createRequest({
            url: 'testURL',
            ajax: function (fig) {
                self.ajaxFig = fig;
            }
        });
    }
});

test("type is GET", function () {
    this.request.search();
    strictEqual(this.ajaxFig.type, 'GET');
});

test("url default", function () {
    this.request.search();
    strictEqual(this.ajaxFig.url, 'testURL');
});

test("dataType is json", function () {
    this.request.search();
    strictEqual(this.ajaxFig.dataType, 'json');
});

test("url setOrder", function () {
    this.request.setOrder({ foo: 'bar' });
    this.request.search();
    strictEqual(this.ajaxFig.url, 'testURL?order_foo=bar');
});

test("url setFilter", function () {
    this.request.setFilter({ foo: 'bar' });
    this.request.search();
    strictEqual(this.ajaxFig.url, 'testURL?filter_foo=bar');
});

test("url setPage", function () {
    this.request.setPage(5);
    this.request.search();
    strictEqual(this.ajaxFig.url, 'testURL?page=5');
});

test("url setMultiple", function () {
    this.request.setFilter({ foo: 'bar', baz: 'bat' });
    this.request.setOrder({ bla: 'fad' });
    this.request.search();
    strictEqual(
        this.ajaxFig.url,
        'testURL?filter_foo=bar&filter_baz=bat&order_bla=fad'
    );
});

test("url set array", function () {
    this.request.setFilter({ foo: ['a', 'b'] });
    this.request.search();
    strictEqual(this.ajaxFig.url, 'testURL?filter_foo=a,b');
});

test("setFilter doesnt include falsey values except for 0", function () {
    this.request.setFilter({ test: 'foo' });
    this.request.setFilter({
        test: '',
        emptySting: '',
        emptyArray: [],
        'undefined': undefined,
        'null': null,
        zero: 0
    });
    this.request.search();
    strictEqual(this.ajaxFig.url, 'testURL?filter_zero=0');
});


test("setOrder doesnt include falsey values except for 0", function () {
    this.request.setOrder({ test: 'foo' });
    this.request.setOrder({
        test: '',
        emptySting: '',
        emptyArray: [],
        'undefined': undefined,
        'null': null,
        zero: 0
    });
    this.request.search();
    strictEqual(this.ajaxFig.url, 'testURL?order_zero=0');
});

var buildTestPublishes = function (self, subscriptionName, functionName, publishOverrideData) {
    functionName = functionName || subscriptionName;
    expect(1);
    self.request.subscribe(subscriptionName, function (response) {
        strictEqual('testData', response);
    });
    self.request.search();
    self.ajaxFig[functionName](publishOverrideData || { responseJSON: 'testData' });
};

test('publishes on success', function () {
    buildTestPublishes(this, 'success', 'success', 'testData');
});

test('publishes on error', function () {
    buildTestPublishes(this, 'error');
});

test('publishes on complete', function () {
    buildTestPublishes(this, 'complete');
});

test('publishes on setPage', function () {
    expect(1);
    this.request.subscribe('setPage', function (pageNumber) {
        strictEqual(pageNumber, 5);
    });
    this.request.setPage(5);
});

test('delete method', function () {
    this.request['delete']({
        uniquelyIdentifyingFields: { a: '1', b: '2' }
    });
    strictEqual(
        this.ajaxFig.url, 'testURL?a=1&b=2&action=delete',
        'correct url'
    );
    strictEqual(this.ajaxFig.type, 'POST', 'type is POST');
    strictEqual(this.ajaxFig.dataType, 'json', 'dataType is json');
});
