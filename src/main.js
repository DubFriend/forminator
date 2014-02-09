var createFormGroup = function (fig) {
    var self = {},
        $self = fig.$input.closest('.frm-group'),
        input = fig.input;

    self.$ = function (selector) {
        return selector ? $self.find(selector) : $self;
    };
};






var createInput = function (fig, my) {
    var self = mixinPubSub(),
        $self = fig.$;

    self.getType = function () {
        throw 'implement me (return type. "text", "radio", etc.)';
    };

    self.$ = function (selector) {
        return selector ? $self.find(selector) : $self;
    };

    self.get = function () {
        return self.$().val();
    };

    self.set = function (newValue) {
        var oldValue = self.get();
        if(oldValue !== newValue) {
            self.$().val(newValue);
            self.publish('change', newValue);
        }
    };

    my.buildSetter = function (callback) {
        return function (newValue) {
            var oldValue = self.get();
            if(oldValue !== newValue) {
                callback.call(self, newValue);
                self.publish('change', newValue);
            }
        };
    };

    return self;
};

var createInputText = function (fig) {
    var my = {},
        self = createInput(fig, my);

    self.getType = function () {
        return 'text';
    };

    self.$().keyup(function (e) {
        self.publish('change', self.get());
    });

    return self;
};

var createInputTextarea = function (fig) {
    var my = {},
        self = createInput(fig, my);

    self.getType = function () {
        return 'textarea';
    };

    self.get = function () {
        return self.$().html();
    };

    self.set = my.buildSetter(function (newValue) {
        this.$().html(newValue);
    });

    self.$().keyup(function () {
        self.publish('change', self.get());
    });

    return self;
};

var createInputSelect = function (fig) {
    var my = {},
        self = createInput(fig, my);

    self.getType = function () {
        return 'select';
    };

    self.$().change(function () {
        self.publish('change', self.get());
    });

    return self;
};

var createInputRadio = function (fig) {
    var my = {},
        self = createInput(fig, my);

    self.getType = function () {
        return 'radio';
    };

    self.get = function () {
        return self.$().filter(':checked').val();
    };

    self.set = my.buildSetter(function (newValue) {
        self.$().filter('[value="' + newValue + '"]').prop('checked', true);
    });

    self.$().change(function () {
        self.publish('change', self.get());
    });

    return self;
};

var createInputCheckbox = function (fig) {
    var my = {},
        self = createInput(fig, my);

    self.getType = function () {
        return 'checkbox';
    };

    self.get = function () {
        var values = [];
        self.$().filter(':checked').each(function () {
            if($(this).is(':checked')) {
                values.push($(this).val());
            }
        });
        return values;
    };

    self.set = function (newValues) {
        newValues = newValues || [];
        var oldValues = self.get(),
            isDifferent = false;

        if(oldValues.length === newValues.length) {
            foreach(oldValues, function (value) {
                if(indexOf(newValues, value) === -1) {
                    isDifferent = true;
                }
            });
        }
        else {
            isDifferent = true;
        }

        if(isDifferent) {
            self.$().each(function () {
                $(this).prop('checked', false);
            });
            foreach(newValues, function (value) {
                self.$().filter('[value="' + value + '"]').prop('checked', true);
            });
            self.publish('change', newValues);
        }
    };

    self.$().click(function () {
        self.publish('change', self.get());
    });

    return self;
};

var createInputFile = function (fig) {
    var self = {};

    self.getType = function () {
        return 'file';
    };

    return self;
};

var buildFormInputs = function (fig) {
    var $self = fig.$,
        factory = fig.factory,
        inputs = {};
        files = {};

    var addInputsBasic = function (type, selector, group) {
        group = group || inputs;
        $self.find(selector).each(function () {
            group[$(this).attr('name')] = factory.input[type]({ $: $(this) });
        });
    };

    addInputsBasic('text', 'input[type="text"]');
    addInputsBasic('textarea', 'textarea');
    addInputsBasic('select', 'select');
    addInputsBasic('file', 'input[type="file"]', files);

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

    return {
        inputs: inputs,
        files: files
    };
};
