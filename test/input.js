var $fixture = $('#qunit-fixture');

var buildSetup = function (fig) {
    return function() {
        $fixture.html($('#forminator').html());
        this.$ = $fixture.find(fig.selector);
        this.input = fig.createInput({ $: this.$ });
    };
};

var testGet = function() {
    this.$.val('b');
    deepEqual(this.input.get(), 'b', 'gets current value');
};

var testSet = function() {
    this.input.set('b');
    deepEqual(this.$.val(), 'b', 'text input value is set');
};

var testPublishesOnSetChange = function() {
    expect(1);
    this.input.subscribe('change', function (data) {
        deepEqual(data, 'b', 'publishes changed data');
    });
    this.input.set('b');
};

var testNotPublishesOnSetNotChange = function() {
    expect(0);
    this.input.set('b');
    this.input.subscribe('change', function (data) {
        ok(false);
    });
    this.input.set('b');
};



module("createInputText", {
    setup: buildSetup({
        selector: 'input[name="text"]',
        createInput: createInputText
    })
});

test("textInput get", testGet);
test("textInput set", testSet);
test("textInput set publishes change if changed", testPublishesOnSetChange);
test("textInput set no publish if data not different", testNotPublishesOnSetNotChange);

test("textInput set publishes change on keyup", function () {
    expect(1);
    this.input.set('a');
    this.input.subscribe('change', function (data) {
        deepEqual(data, 'a', 'published');
    });
    // http://stackoverflow.com/questions/832059/definitive-way-to-trigger-keypress-events-with-jquery
    var keyUpEvent = $.Event('keyup');
    this.$.trigger(keyUpEvent);
});

module("createInputTextarea", {
    setup: buildSetup({
        selector: '[name="textarea"]',
        createInput: createInputTextarea
    })
});

test("textareaInput get", function() {
    this.$.html('b');
    deepEqual(this.input.get(), 'b', 'gets current value');
});

test("textareaInput set", function() {
    this.input.set('b');
    deepEqual(this.$.html(), 'b', 'text input value is set');
});

test("textareaInput set publishes change if changed", testPublishesOnSetChange);
test("textareaInput set no publish if data not different", testNotPublishesOnSetNotChange);

test("textareaInput set publishes change on keyup", function () {
    expect(1);
    this.input.set('a');
    this.input.subscribe('change', function (data) {
        deepEqual(data, 'a', 'published');
    });
    // http://stackoverflow.com/questions/832059/definitive-way-to-trigger-keypress-events-with-jquery
    var keyUpEvent = $.Event('keyup');
    this.$.trigger(keyUpEvent);
});

module("createInputSelect", {
    setup: buildSetup({
        selector: '[name="select"]',
        createInput: createInputSelect
    })
});

test("selectInput get", testGet);
test("selectInput set", testSet);
test("selectInput set publishes change if changed", testPublishesOnSetChange);
test("selectInput set no publish if data not different", testNotPublishesOnSetNotChange);

test("selectInput set publishes change on change", function () {
    expect(1);
    this.input.set('b');
    this.input.subscribe('change', function (data) {
        deepEqual(data, 'b', 'published');
    });
    this.$.change();
});


module("createInputRadio", {
    setup: buildSetup({
        selector: '[name="radio"]',
        createInput: createInputRadio
    })
});

test("radioInput get", function() {
    this.$.filter('[value="b"]').prop('checked', true);
    deepEqual(this.input.get(), 'b', 'gets current value');
});

test("radioInput set", function() {
    this.input.set('b');
    deepEqual(this.$.filter(':checked').val(), 'b', 'text input value is set');
});

test("radioInput set publishes change if changed", testPublishesOnSetChange);
test("radioInput set no publish if data not different", testNotPublishesOnSetNotChange);

test("radioInput set publishes change on change", function () {
    expect(1);
    this.input.set('b');
    this.input.subscribe('change', function (data) {
        deepEqual(data, 'b', 'published');
    });
    this.$.filter('[value="a"]').change();
});

module("createInputCheckbox", {
    setup: buildSetup({
        selector: '[name="checkbox[]"]',
        createInput: createInputCheckbox
    })
});

test("checkboxInput get", function() {
    this.$.filter('[value="b"]').prop('checked', true);
    deepEqual(this.input.get(), ['b'], 'gets current value');
});

test("checkboxInput set", function() {
    this.input.set(['b']);
    deepEqual(this.input.get(), ['b'], 'text input value is set');
});

test("checkboxInput set erases previously set", function() {
    this.$.filter('[value="a"]').prop('checked', true);
    this.input.set(['b']);
    deepEqual(this.input.get(), ['b'], 'text input value is set');
});

test("checkboxInput set multiple", function() {
    this.input.set(['b', 'a']);
    deepEqual(this.input.get(), ['a','b'], 'text input value is set');
});

test("checkboxInput set publishes change if changed", testPublishesOnSetChange);
test("checkboxInput set no publish if data not different", testNotPublishesOnSetNotChange);

test("radioInput set publishes change on click", function () {
    expect(1);
    this.input.subscribe('change', function (data) {
        deepEqual(data, ['a'], 'published');
    });
    this.$.filter('[value="a"]').click();
});

// module("buildFormElements", { setup: setup });
