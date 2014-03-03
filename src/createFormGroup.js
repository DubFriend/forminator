var createFormGroup = function (fig) {
    var self = {},
        input = fig.input,
        $self = input.$().closest('.frm-group');

    self.get = input.get || function () {};
    self.set = input.set || function () {};
    self.clear = input.clear || function () {};
    self.disable = input.disable;
    self.enable = input.enable;
    self.getType = input.getType;

    self.$ = function (selector) {
        return selector ? $self.find(selector) : $self;
    };

    // minimizing dom manipulation.
    (function () {
        var oldMessage = null,
            isError = false;

        self.setFeedback = function (newMessage) {
            if(!isError) {
                self.$().addClass('error');
            }
            if(newMessage !== oldMessage) {
                self.$('.frm-feedback').html(newMessage);
            }
            oldMessage = newMessage;
            isError = true;
        };

        self.clearFeedback = function () {
            if(isError) {
                self.$().removeClass('error');
                self.$('.frm-feedback').html('');
            }
            oldMessage = null;
            isError = false;
        };
    }());

    return self;
};
