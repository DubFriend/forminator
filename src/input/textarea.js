var createInputTextarea = function (fig) {
    var my = {},
        self = createInput(fig, my);

    self.getType = function () {
        return 'textarea';
    };

    self.get = function () {
        return self.$().val();
    };

    self.set = my.buildSetter(function (newValue) {
        this.$().text(newValue);
    });

    self.$().keyup(function () {
        self.publish('change', self.get());
    });

    return self;
};
