var $fixture = $('#qunit-fixture');

module('buildFormInputs',{
    setup: function () {
        $fixture.html($('#forminator').html());
        this.inputs = buildFormInputs({
            $: $('#frm-name'),
            factory: createMockFactory()
        });
    }
});

var testHelper = function (name, length) {
    return function () {
        deepEqual(this.inputs[name].$.length, length, length + ' html element(s)');
        this.inputs[name].$.each(function () {
            deepEqual($(this).attr('name'), name, 'name is ' + name);
        });
    };
};

test('text', testHelper('text', 1));
test('text2', testHelper('text2', 1));
test('textarea', testHelper('textarea', 1));
test('textarea2', testHelper('textarea2', 1));
test('radio', testHelper('radio', 2));
test('radio2', testHelper('radio2', 2));
test('checkbox[]', testHelper('checkbox[]', 2));
test('checkbox2[]', testHelper('checkbox2[]', 2));
test('select', testHelper('select', 1));
test('select2', testHelper('select2', 1));
test('file', testHelper('file', 1));
test('file2', testHelper('file2', 1));
