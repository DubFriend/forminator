var createInputTextarea = function (fig) {
    var my = {},
        self = createInput(fig, my);

    self.getType = function () {
        return 'textarea';
    };

    self.$().keyup(debounce(200, function () {
        self.publish('change', self);
    }));

    return self;
};
