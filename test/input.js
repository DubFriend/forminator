var $fixture = $('#qunit-fixture');

var buildSetup = function (fig) {
    return function() {
        $fixture.html($('#forminator').html());
        this.$ = $fixture.find('#frm-name ' + fig.selector);
        this.createInput = fig.createInput;
        this.input = this.createInput({ $: this.$ });
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

var testClear = function () {
    this.input.clear();
    strictEqual(this.input.get(), '', 'input cleared');
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

var testGetType = function (type) {
    return function () {
        deepEqual(this.input.getType(), type, 'getType returns ' + type);
    };
};

var testDisabled = function () {
    expect(2);
    this.input.subscribe('isEnabled', function (isEnabled) {
        deepEqual(isEnabled, false, 'publishes result');
    });
    this.input.disable();
    deepEqual(this.$.prop('disabled'), true, 'disabled property set');
};

var testEnabled = function () {
    expect(2);
    this.input.disable();
    this.input.subscribe('isEnabled', function (isEnabled) {
        deepEqual(isEnabled, true, 'publishes result');
    });
    this.input.enable();
    deepEqual(this.$.prop('disabled'), false, 'disabled property not set');
};

var testFieldMap = function (fieldMap, setValue, expectedValue) {
    return function () {
        fieldMap = fieldMap || function (value) {
            return value.toUpperCase();
        };
        setValue = setValue || 'foo';
        expectedValue = expectedValue || 'FOO';
        var input = this.createInput({ $: this.$, fieldMap: fieldMap });
        input.set(setValue);
        deepEqual(input.get(), expectedValue, 'mapped value on set');
    };
};

module("createInputText", {
    setup: buildSetup({
        selector: 'input[name="text"]',
        createInput: createInputText
    })
});

test("textInput get", testGet);
test("textInput set", testSet);
test("textInput clear", testClear);
test("textInput set publishes change if changed", testPublishesOnSetChange);
test("textInput set no publish if data not different", testNotPublishesOnSetNotChange);
test("textInput getType", testGetType('text'));
test("textInput disable", testDisabled);
test("textInput enable", testEnabled);
test("textInput fieldMap", testFieldMap());

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
    deepEqual(this.$.val(), 'b', 'textarea input value is set');
});


test("textareaInput clear", testClear);

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

test("textareaInput getType", testGetType('textarea'));
test("textareaInput disable", testDisabled);
test("textareaInput enable", testEnabled);
test("textareaInput fieldMap", testFieldMap());

module("createInputSelect", {
    setup: buildSetup({
        selector: '[name="select"]',
        createInput: createInputSelect
    })
});

test("selectInput get", testGet);
test("selectInput set", testSet);
test("selectInput clear", function () {
    this.input.clear();
    strictEqual(this.input.get(), null, 'input cleared');
});

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

test("selectInput getType", testGetType('select'));
test("selectInput disable", testDisabled);
test("selectInput enable", testEnabled);
test("selectInput fieldMap", testFieldMap(function (value) {
    return value.toLowerCase();
}, 'A', 'a'));

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
    strictEqual(this.$.filter(':checked').val(), 'b', 'radio input value is set');
});

test("radioInput set to empty string", function () {
    this.input.set('b');
    this.input.set('');
    strictEqual(this.$.filter(':checked').length, 0, 'radio input value is cleared');
});

test("radioInput clear", function () {
    this.input.clear();
    deepEqual(this.input.get(), null, 'input cleared');
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

test("radioInput getType", testGetType('radio'));
test("radioInput disable", testDisabled);
test("radioInput enable", testEnabled);

test("radioInput fieldMap", testFieldMap(function (value) {
    return value.toLowerCase();
}, 'A', 'a'));

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

test("checkboxInput clear", function () {
    this.input.clear();
    deepEqual(this.input.get(), [], 'input cleared');
});

test("checkboxInput set", function () {
    this.input.set(['b']);
    deepEqual(this.input.get(), ['b'], 'text input value is set');
});

test("checkboxInput set empty string", function () {
    this.$.prop('checked', true);
    this.input.set('');
    deepEqual(this.input.get(), [], 'checkbox is cleared');
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

test("checkboxInput set publishes change if changed", function() {
    expect(1);
    this.input.subscribe('change', function (data) {
        deepEqual(data, ['b'], 'publishes changed data');
    });
    this.input.set(['b']);
});

test("checkboxInput set wraps with array if set value not an array", function() {
    expect(2);
    this.input.subscribe('change', function (data) {
        deepEqual(data, ['b'], 'published data is wrapped');
    });
    this.input.set('b');
    deepEqual(this.input.get(), ['b'], 'get data is wrapped');
});

test("checkboxInput set no publish if data not different", testNotPublishesOnSetNotChange);

test("checkboxInput set publishes change on click", function () {
    expect(1);
    this.input.subscribe('change', function (data) {
        deepEqual(data, ['a'], 'published');
    });
    this.$.filter('[value="a"]').click();
});

test("checkboxInput getType", testGetType('checkbox'));
test("checkboxInput disable", testDisabled);
test("checkboxInput enable", testEnabled);

test("checkboxInput fieldMap default", function () {
    this.input.set('a,b');
    deepEqual(this.input.get(), ['a', 'b'], 'splits comma delimited string to array');
});

test("checkboxInput fieldMap default excess whitespace removed", function () {
    this.input.set(' a ,  b  ');
    deepEqual(this.input.get(), ['a', 'b'], 'splits comma delimited string to array');
});

test("checkboxInput fieldMap", testFieldMap(function (values) {
    return map(values, function (value) {
        return value.toLowerCase();
    });
}, ['A'], ['a']));

module("createInputFile", {
    setup: buildSetup({
        selector: '[name="file"]',
        createInput: createInputFile
    })
});

test("fileInput clear", testClear);
test("fileInput getType", testGetType('file'));
test("fileInput disable", testDisabled);
test("fileInput enable", testEnabled);
test("fileInput getFileName, file not set", function () {
    strictEqual(this.input.get(), '');
});
test("fileInput publishes filename when file changed", function () {
    expect(1);
    this.input.subscribe('change', function (data) {
        strictEqual(data, '', 'publishes');
    });
    this.$.change();
});


module("createInputFile", {
    setup: buildSetup({
        selector: '[name="button"]',
        createInput: createInputButton
    })
});

test("buttonInput getType", testGetType('button'));
test("buttonInput disable", testDisabled);
test("buttonInput enable", testEnabled);
test("buttonInput get", testGet);
test("buttonInput set", testSet);
test("buttonInput clear", testClear);
test("buttonInput fieldMap", testFieldMap());
