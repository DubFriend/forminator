var createInputText = function (fig) {
    var my = {},
        self = createInput(fig, my);

    self.getType = function () {
        return 'text';
    };

    self.$().keyup(debounce(200, function (e) {
        self.publish('change', self);
    }));

    return self;
};
