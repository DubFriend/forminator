var createInputFile = function (fig) {
    var my = {},
        self = createBaseInput(fig, my);

    self.getType = function () {
        return 'file';
    };

    self.get = function () {
        return last(self.$().val().split('\\'));
    };

    self.clear = function () {
        $.fileAjax.clearFileInputs(self.$().parent());
    };

    self.$().change(function () {
        self.publish('change', self);
        self.publish('validate', self);
    });

    return self;
};
