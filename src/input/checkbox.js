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

        newValues = isArray(newValues) ? newValues : [newValues];

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
                self.$().filter('[value="' + value + '"]')
                    .prop('checked', true);
            });
            self.publish('change', newValues);
        }
    };

    self.$().click(function () {
        self.publish('change', self.get());
    });

    return self;
};
