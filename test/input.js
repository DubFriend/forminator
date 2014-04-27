var $fixture = $('#qunit-fixture');

var buildSetup = function (fig) {
    return function() {
        $fixture.html($('#forminator').html());
        this.$ = $fixture.find('.frm-name ' + fig.selector);
        this.createInput = fig.createInput;
        this.input = this.createInput({ $: this.$ });
        this.testValue = fig.testValue;
    };
};

var testGet = function() {
    var value = this.testValue || 'b';
    this.$.val(value);
    deepEqual(this.input.get(), value, 'gets current value');
};

var testSet = function() {
    var value = this.testValue || 'b';
    this.input.set(value);
    deepEqual(this.$.val(), value, 'text input value is set');
};

var testClear = function () {
    this.input.clear();
    strictEqual(this.input.get(), '', 'input cleared');
};

var testPublishesOnSetChange = function() {
    var value = this.testValue || 'b';
    expect(1);
    this.input.subscribe('change', function (input) {
        deepEqual(input.get(), value, 'publishes changed data');
    });
    this.input.set(value);
};

var testNotPublishesOnSetNotChange = function() {
    expect(0);
    var value = this.testValue || 'b';
    this.input.set(value);
    this.input.subscribe('change', function (data) {
        ok(false);
    });
    this.input.set(value);
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

var testPublishesChangeOnKeyup = function () {
    expect(1);
    var value = this.testValue || 'a';
    this.input.set(value);
    this.input.subscribe('change', function (input) {
        deepEqual(input.get(), value, 'published');
        start();
    });
    // http://stackoverflow.com/questions/832059/definitive-way-to-trigger-keypress-events-with-jquery
    var keyUpEvent = $.Event('keyup');
    this.$.trigger(keyUpEvent);
};

var testPublishesValidateOn = function (eventName) {
    return function () {
        expect(1);
        var self = this;
        self.input.subscribe('validate', function (input) {
            strictEqual(input, self.input, 'passed input object');
            start();
        });
        self.$.trigger($.Event(eventName));
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
asyncTest("textInput set publishes change on keyup", testPublishesChangeOnKeyup);
asyncTest("textInput publishes validate on blur", testPublishesValidateOn('blur'));

module("createInputPassword", {
    setup: buildSetup({
        selector: 'input[name="password"]',
        createInput: createInputText
    })
});

test("passwordInput get", testGet);
test("passwordInput set", testSet);
test("passwordInput clear", testClear);
test("passwordInput set publishes change if changed", testPublishesOnSetChange);
test("passwordInput set no publish if data not different", testNotPublishesOnSetNotChange);
test("passwordInput getType", testGetType('text'));
test("passwordInput disable", testDisabled);
test("passwordInput enable", testEnabled);
asyncTest("passwordInput set publishes change on keyup", testPublishesChangeOnKeyup);
asyncTest("passwordInput publishes validate on blur", testPublishesValidateOn('blur'));

module("createInputEmail", {
    setup: buildSetup({
        selector: 'input[name="email"]',
        createInput: createInputText
    })
});

test("emailInput get", testGet);
test("emailInput set", testSet);
test("emailInput clear", testClear);
test("emailInput set publishes change if changed", testPublishesOnSetChange);
test("emailInput set no publish if data not different", testNotPublishesOnSetNotChange);
test("emailInput getType", testGetType('text'));
test("emailInput disable", testDisabled);
test("emailInput enable", testEnabled);
asyncTest("emailInput set publishes change on keyup", testPublishesChangeOnKeyup);
asyncTest("emailInput publishes validate on blur", testPublishesValidateOn('blur'));

module("createInputURL", {
    setup: buildSetup({
        selector: 'input[name="url"]',
        createInput: createInputText
    })
});

test("urlInput get", testGet);
test("urlInput set", testSet);
test("urlInput clear", testClear);
test("urlInput set publishes change if changed", testPublishesOnSetChange);
test("urlInput set no publish if data not different", testNotPublishesOnSetNotChange);
test("urlInput getType", testGetType('text'));
test("urlInput disable", testDisabled);
test("urlInput enable", testEnabled);
asyncTest("urlInput set publishes change on keyup", testPublishesChangeOnKeyup);
asyncTest("urlInput publishes validate on blur", testPublishesValidateOn('blur'));

module("createInputRange", {
    setup: buildSetup({
        selector: 'input[name="range"]',
        createInput: createInputRange,
        testValue: '5'
    })
});

test("rangeInput get", testGet);
test("rangeInput set", testSet);
test("rangeInput set publishes change if changed", testPublishesOnSetChange);
test("rangeInput set no publish if data not different", testNotPublishesOnSetNotChange);
test("rangeInput getType", testGetType('range'));
test("rangeInput disable", testDisabled);
test("rangeInput enable", testEnabled);
test("rangeInput set publishes change on change", function () {
    expect(1);
    this.input.set('1');
    this.input.subscribe('change', function (input) {
        deepEqual(input.get(), '1', 'published');
    });
    this.$.change();
});
asyncTest("rangeInput publishes validate on change", testPublishesValidateOn('change'));


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
test("textareaInput getType", testGetType('textarea'));
test("textareaInput disable", testDisabled);
test("textareaInput enable", testEnabled);
asyncTest("textareaInput set publishes change on keyup", testPublishesChangeOnKeyup);
asyncTest("textareaInput publishes validate on blur", testPublishesValidateOn('blur'));

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
test("selectInput getType", testGetType('select'));
test("selectInput disable", testDisabled);
test("selectInput enable", testEnabled);
test("selectInput set publishes change on change", function () {
    expect(1);
    this.input.set('b');
    this.input.subscribe('change', function (input) {
        deepEqual(input.get(), 'b', 'published');
    });
    this.$.change();
});
asyncTest("selectInput publishes validate on change", testPublishesValidateOn('change'));


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
    this.input.subscribe('change', function (input) {
        deepEqual(input.get(), 'b', 'published');
    });
    this.$.filter('[value="a"]').change();
});

test("radioInput set publishes validate on change", function () {
    expect(1);
    var self = this;
    this.input.set('b');
    this.input.subscribe('validate', function (input) {
        strictEqual(input, self.input, 'published');
    });
    this.$.filter('[value="a"]').change();
});



test("radioInput getType", testGetType('radio'));
test("radioInput disable", testDisabled);
test("radioInput enable", testEnabled);


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
    this.input.subscribe('change', function (input) {
        deepEqual(input.get(), ['a'], 'published');
    });
    this.$.filter('[value="a"]').click();
});

test("checkboxInput set publishes validate on click", function () {
    expect(1);
    var self = this;
    this.input.subscribe('validate', function (input) {
        strictEqual(input, self.input, 'published');
    });
    this.$.filter('[value="a"]').click();
});

test("checkboxInput getType", testGetType('checkbox'));
test("checkboxInput disable", testDisabled);
test("checkboxInput enable", testEnabled);


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
    this.input.subscribe('change', function (input) {
        strictEqual(input.get(), '', 'publishes');
    });
    this.$.change();
});
asyncTest("fileInput publishes validate on change", testPublishesValidateOn('change'));

module("createInputButton", {
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
