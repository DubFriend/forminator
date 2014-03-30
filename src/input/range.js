var createInputRange = function (fig) {
    var my = {},
        self = createInput(fig, my);

    self.getType = function () {
        return 'range';
    };

     self.$().change(function (e) {
        self.publish('change', self);
    });

    return self;
};
