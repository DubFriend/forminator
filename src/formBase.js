var createFormBase = function (fig) {
    var self = mixinPubSub(),
        $self = fig.$,
        $feedback = $self.find('.frm-global-feedback'),
        inputs = fig.inputs;

    //minimize dom manipulation
    (function () {
        var isError = false,
            oldMessage = null;

        self.setGlobalFeedback = function (newMessage) {
            self.clearGlobalSuccess();
            if(!isError) {
                $self.addClass('error');
            }
            if(newMessage !== oldMessage) {
                $feedback.html(newMessage);
            }
            isError = true;
            oldMessage = newMessage;
        };

        self.clearGlobalError = function () {
            if(isError) {
                $self.removeClass('error');
            }

            if(oldMessage) {
                $feedback.html('');
            }
            isError = false;
            oldMessage = null;
        };
    }());

    (function () {
        var isSuccess = false,
            oldMessage = null;

        self.setGlobalSuccess = function (newMessage) {
            self.clearFeedback();
            if(!isSuccess) {
                $self.addClass('success');
            }
            if(newMessage !== oldMessage) {
                $feedback.html(newMessage);
            }
            isSuccess = true;
            oldMessage = newMessage;
        };

        self.clearGlobalSuccess = function () {
            if(isSuccess) {
                $self.removeClass('success');
            }
            if(oldMessage) {
                $feedback.html('');
            }
            isSuccess = false;
            oldMessage = null;
        };
    }());

    self.clearGlobalFeedback = function () {
        self.clearGlobalError();
        self.clearGlobalSuccess();
    };

    self.setFeedback = function (feedback) {
        feedback = feedback || {};
        self.clearFeedback();
        foreach(subSet(inputs, keys(feedback)), function (input, name) {
            input.setFeedback(feedback[name]);
        });
        self.setGlobalFeedback(feedback.GLOBAL);
    };



    self.validate = fig.validate || function (data) {
        return {};
    };

    var filterInputs = function () {
        var filteredTypes = argumentsToArray(arguments);
        return filter(inputs, function (input) {
            return !inArray(filteredTypes, input.getType());
        });
    };

    var onlyInputs = function () {
        var filteredTypes = argumentsToArray(arguments);
        return filter(inputs, function (input) {
            return inArray(filteredTypes, input.getType());
        });
    };

    self.clearFeedback = function () {
        call(inputs, 'clearFeedback');
        self.clearGlobalFeedback();
    };

    self.disable = function () {
        // disabling file inputs interferes with iframe ajax. (form disables)
        call(filterInputs('file'), 'disable');
    };

    self.enable = function () {
        call(inputs, 'enable');
    };

    self.get = function () {
        return call(filterInputs('file', 'button'), 'get');
    };

    self.set = function (nameOrObject, valueOrNothing) {
        if(isObject(nameOrObject)) {
            foreach(nameOrObject, function (value, name) {
                self.set(name, value);
            });
        }
        else {
            if(inputs[nameOrObject]) {
                inputs[nameOrObject].set(valueOrNothing);
            }
        }
    };

    self.clear = function (options) {
        options = options || {};
        var notCleared = options.isClearHidden ?
            ['button'] : ['button', 'hidden'];
        call(filterInputs.apply(null, notCleared), 'clear');
    };

    (function () {
        var defaultData = self.get();
        self.reset = function () {
            call(onlyInputs('file'), 'clear');
            self.set(copy(defaultData));
        };
    }());

    return self;
};
