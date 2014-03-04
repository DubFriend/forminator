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

test("url setMultiple", function () {
    this.request.setFilter({ foo: 'bar', baz: 'bat' });
    this.request.setOrder({ bla: 'fad' });
    this.request.search();
    strictEqual(
        this.ajaxFig.url,
        'testURL?filter_foo=bar&filter_baz=bat&order_bla=fad'
    );
});

test("setFilter doesnt include falsey values except for 0", function () {
    this.request.setFilter({ test: 'foo' });
    this.request.setFilter({
        test: '',
        emptySting: '',
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
        'undefined': undefined,
        'null': null,
        zero: 0
    });
    this.request.search();
    strictEqual(this.ajaxFig.url, 'testURL?order_zero=0');
});

var buildTestPublishes = function (self, subscriptionName, functionName) {
    functionName = functionName || subscriptionName;
    expect(1);
    self.request.subscribe(subscriptionName, function (response) {
        strictEqual('testData', response);
    });
    self.request.search();
    self.ajaxFig[functionName]('testData');
};

test('publishes on success', function () {
    buildTestPublishes(this, 'success');
});

test('publishes on error', function () {
    buildTestPublishes(this, 'error');
});

test('publishes on complete', function () {
    buildTestPublishes(this, 'complete');
});
