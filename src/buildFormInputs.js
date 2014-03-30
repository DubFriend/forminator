var buildFormInputs = function (fig) {
    var $self = fig.$,
        factory = fig.factory,
        inputs = {};

    var addInputsBasic = function (type, selector, group) {
        group = group || inputs;
        $self.find(selector).each(function () {
            var name = $(this).attr('name');
            group[name] = factory.input[type]({
                $: $(this)
            });
        });
    };

    addInputsBasic('text', 'input[type="text"]');
    addInputsBasic('text', 'input[type="password"]');
    addInputsBasic('text', 'input[type="email"]');
    addInputsBasic('text', 'input[type="url"]');

    addInputsBasic('range', 'input[type="range"]');

    addInputsBasic('textarea', 'textarea');
    addInputsBasic('select', 'select');
    addInputsBasic('file', 'input[type="file"]');
    addInputsBasic('button', 'input[type="button"], input[type="submit"]');
    addInputsBasic('hidden', 'input[type="hidden"]');

    var addInputsGroup = function (type, selector) {
        var names = [];
            $self.find(selector).each(function () {
            if(indexOf(names, $(this).attr('name')) === -1) {
                names.push($(this).attr('name'));
            }
        });
        foreach(names, function (name) {
            inputs[name] = factory.input[type]({
                $: $self.find('input[name="' + name + '"]')
            });
        });
    };

    addInputsGroup('radio', 'input[type="radio"]');
    addInputsGroup('checkbox', 'input[type="checkbox"]');

    return inputs;
};
