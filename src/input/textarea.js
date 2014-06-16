var createInputTextarea = function (fig) {
    var my = {},
        self = createInput(fig, my);

    self.getType = function () {
        return 'textarea';
    };

    self.$().keyup(debounce(300, function () {
        self.publish('change', self);
    }));

    self.$().blur(function (e) {
        self.publish('validate', self);
    });

    return self;
};
