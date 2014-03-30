var createMockFactory = function () {
    return {
        input: {
            text: identity,
            textarea: identity,
            select: identity,
            radio: identity,
            checkbox: identity,
            file: identity,
            button: identity,
            hidden: identity,
            range: identity
        }
    };
};

var $fixture = $('#qunit-fixture');

module('buildFormInputs',{
    setup: function () {
        $fixture.html($('#forminator').html());
        this.inputs = buildFormInputs({
            $: $('.frm-name'),
            factory: createMockFactory()
        });
    }
});

var buildTest = function (name, length) {
    test(name + ' length', function () {
        deepEqual(this.inputs[name].$.length, length, length + ' html element(s)');
    });

    test(name + ' name(s)', function () {
        this.inputs[name].$.each(function () {
            deepEqual($(this).attr('name'), name, 'name is ' + name);
        });
    });

};


buildTest('text', 1);
buildTest('text2', 1);
buildTest('password', 1);
buildTest('email', 1);
buildTest('url', 1);
buildTest('range', 1);

buildTest('textarea', 1);
buildTest('textarea2', 1);
buildTest('radio', 2);
buildTest('radio2', 2);
buildTest('checkbox[]', 2);
buildTest('checkbox2[]', 2);
buildTest('select', 1);
buildTest('select2', 1);
buildTest('file', 1);
buildTest('file2', 1);
buildTest('submit', 1);
buildTest('button', 1);
buildTest('hidden', 1);
