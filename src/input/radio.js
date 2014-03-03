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
        self.$().filter('[value="' + newValue + '"]').prop('checked', true);
    });

    self.$().change(function () {
        self.publish('change', self.get());
    });

    return self;
};
