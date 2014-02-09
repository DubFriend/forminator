var createFormGroup = function (fig) {
    var self = {},
        $self = fig.$input.closest('.frm-group');

    self.$ = function (selector) {
        return selector ? $self.find(selector) : $self;
    };
};
