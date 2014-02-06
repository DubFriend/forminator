var setup = function () {
    this.$fixture = $('#qunit-fixture');
    this.$fixture.html($('#forminator').html());
    this.$text = this.$fixture.find('input[name="text"]');
    this.textInput = createInputText({ $: this.$text });
};


module("textInput", { setup: setup });

test("test text input get", function() {
    this.$text.val('foo');
    deepEqual(this.textInput.get(), 'foo', 'gets current value');
});

test("test text input set", function() {
    this.textInput.set('foo');
    deepEqual(this.$text.val(), 'foo', 'text input value is set');
});

test("test text input set publishes change if changed", function() {
    expect(1);
    this.textInput.subscribe('change', function (data) {
        deepEqual(data, 'foo', 'publishes changed data');
    });
    this.textInput.set('foo');
});

test("test text input set no publish if data not different", function() {
    expect(0);
    this.$text.val('foo');
    this.textInput.subscribe('change', function (data) {
        ok(false);
    });
    this.textInput.set('foo');
});


module("buildFormElements", { setup: setup });
