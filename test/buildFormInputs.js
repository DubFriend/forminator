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
            hidden: identity
        }
    };
};

var $fixture = $('#qunit-fixture');

module('buildFormInputs',{
    setup: function () {
        $fixture.html($('#forminator').html());
        this.inputs = buildFormInputs({
            $: $('.frm-name'),
            factory: createMockFactory(),
            fieldMap: {
                text: 'text',
                'checkbox[]': 'checkbox[]'
            }
        });
    }
});

var buildTest = function (name, length, isGivenFieldMap) {
    test(name + ' length', function () {
        deepEqual(this.inputs[name].$.length, length, length + ' html element(s)');
    });

    test(name + ' name(s)', function () {
        this.inputs[name].$.each(function () {
            deepEqual($(this).attr('name'), name, 'name is ' + name);
        });
    });

    test(name + ' is' + (isGivenFieldMap ? ' ' : ' not ') + 'given field map', function () {
        if(isGivenFieldMap) {
            strictEqual(this.inputs[name].fieldMap, name, 'given field map');
        }
        else {
            strictEqual(this.inputs[name].fieldMap, undefined, 'not given field map');
        }
    });
};

buildTest('text', 1, true);
buildTest('text2', 1);
buildTest('textarea', 1);
buildTest('textarea2', 1);
buildTest('radio', 2);
buildTest('radio2', 2);
buildTest('checkbox[]', 2, true);
buildTest('checkbox2[]', 2);
buildTest('select', 1);
buildTest('select2', 1);
buildTest('file', 1);
buildTest('file2', 1);
buildTest('submit', 1);
buildTest('button', 1);
buildTest('hidden', 1);
