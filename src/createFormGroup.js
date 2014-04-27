var createFormGroup = function (fig) {
    var self = {},
        input = fig.input,
        $self = input.$().closest('.frm-group'),
        $feedback = $self.find('.frm-feedback');

    self.get = input.get || function () {};
    self.set = input.set || function () {};
    self.clear = input.clear || function () {};
    self.disable = input.disable;
    self.enable = input.enable;
    self.getType = input.getType;
    self.subscribe = input.subscribe;

    self.$ = function (selector) {
        return selector ? $self.find(selector) : $self;
    };

    self.setFeedback = function (newMessage) {
        self.$().removeClass('success');
        self.$().addClass('error');
        $feedback.html(xss(newMessage || ''));
    };

    self.clearFeedback = function () {
        self.$().removeClass('error');
        $feedback.html('');
    };

    self.setSuccess = function (successMessage) {
        self.$().removeClass('error');
        self.$().addClass('success');
        $feedback.html(xss(successMessage || ''));
    };

    self.clearSuccess = function () {
        self.$().removeClass('success');
        $feedback.html('');
    };

    return self;
};
