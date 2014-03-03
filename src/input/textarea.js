var createInputTextarea = function (fig) {
    var my = {},
        self = createInput(fig, my);

    self.getType = function () {
        return 'textarea';
    };

    self.$().keyup(function () {
        self.publish('change', self.get());
    });

    return self;
};
