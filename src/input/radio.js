var createInputRadio = function (fig) {
    var my = {},
        self = createInput(fig, my);

    self.getType = function () {
        return 'radio';
    };

    self.get = function () {
        return self.$().filter(':checked').val() || null;
    };

    self.set = my.buildSetter(function (newValue) {
        if(!newValue) {
            self.$().prop('checked', false);
        }
        else {
            self.$().filter('[value="' + newValue + '"]').prop('checked', true);
        }
    });

    self.$().change(function () {
        self.publish('change', self);
        self.publish('validate', self);
    });

    return self;
};
