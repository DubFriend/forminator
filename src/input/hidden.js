var createInputHidden = function (fig) {
    var my = {},
        self = createInput(fig, my);

    self.getType = function () {
        return 'hidden';
    };

    self.$().keyup(function (e) {
        self.publish('change', self.get());
    });

    return self;
};