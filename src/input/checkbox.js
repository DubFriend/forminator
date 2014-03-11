var createInputCheckbox = function (fig) {
    var my = {},
        self = createInput(fig, my),
        fieldMap = fig.fieldMap || function (value) {
            return isArray(value) ? value : map(value.split(','), function (token) {
                // String.trim() not available in ie8 and earlier.
                return token.replace(/^\s*/, '').replace(/\s*$/, '');
            });
        };

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
        var newMappedValues = fieldMap(newValues);

        var oldValues = self.get(),
            isDifferent = false;

        if(oldValues.length === newMappedValues.length) {
            foreach(oldValues, function (value) {
                if(indexOf(newMappedValues, value) === -1) {
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
            foreach(newMappedValues, function (value) {
                self.$().filter('[value="' + value + '"]')
                    .prop('checked', true);
            });
            self.publish('change', newMappedValues);
        }
    };

    self.$().click(function () {
        self.publish('change', self.get());
    });

    return self;
};
