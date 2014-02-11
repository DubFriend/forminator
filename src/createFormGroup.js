var createFormGroup = function (fig) {
    var self = {},
        input = fig.input,
        $self = input.$().closest('.frm-group');

    self.get = input.get || function () {};
    self.set = input.set || function () {};
    self.disable = input.disable;
    self.enable = input.enable;
    self.getType = input.getType;

    self.$ = function (selector) {
        return selector ? $self.find(selector) : $self;
    };

    self.setFeedback = function (message) {
        self.$().addClass('error');
        self.$('.frm-feedback').html(message);
    };

    self.clearFeedback = function () {
        self.$().removeClass('error');
        self.$('.frm-feedback').html('');
    };

    return self;
};
