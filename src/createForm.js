var createForm = function (fig) {
    var self = mixinPubSub(),
        $self = fig.$,
        $feedback = $self.find('.frm-global-feedback'),
        ajax = fig.ajax,
        url = fig.url || $self.attr('action'),
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

    self.clearFeedback = function () {
        call(inputs, 'clearFeedback');
        self.clearGlobalFeedback();
    };

    self.disable = function () {
        call(inputs, 'disable');
    };

    self.enable = function () {
        call(inputs, 'enable');
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

    ajax($self, function() {
        return {

            url: url,

            dataType: 'json',

            data: self.get(),

            validate: function () {
                var errors = self.validate(self.get());
                if(isEmpty(errors)) {
                    return true;
                }
                else {
                    self.setFeedback(errors);
                    self.publish('error', errors);
                    return false;
                }
            },

            onprogress: function (e) {
                callIfFunction(partial(fig.onprogress, e));
                console.log(e.loaded, e.total);
            },

            beforeSend: function () {
                callIfFunction(fig.beforeSend);
                self.disable();
                self.publish('beforeSend');
            },
            success: function (response) {
                callIfFunction(partial(fig.success, response));
                response = response || {};
                self.setGlobalSuccess(response.successMessage);
                self.publish('success', response);
            },
            error: function (response) {
                // setTimeout(function () {
                callIfFunction(partial(fig.error, response));
                self.setFeedback(response);
                self.publish('error', response);

                // }, 500);
            },
            complete: function (response) {
                // setTimeout(function () {
                callIfFunction(fig.complete, response);
                self.enable();
                self.publish('complete', response);
                // }, 500);
            }
        };
    });

    // ajax($self, {

    //     url: url,

    //     dataType: 'json',

    //     getData: self.get,

    //     validate: function () {
    //         var errors = self.validate(self.get());
    //         if(isEmpty(errors)) {
    //             return true;
    //         }
    //         else {
    //             self.setFeedback(errors);
    //             self.publish('error', errors);
    //             return false;
    //         }
    //     },

    //     onprogress: function (e) {
    //         callIfFunction(partial(fig.onprogress, e));
    //         console.log(e.loaded, e.total);
    //     },

    //     beforeSend: function () {
    //         callIfFunction(fig.beforeSend);
    //         self.disable();
    //         self.publish('beforeSend');
    //     },
    //     success: function (response) {
    //         callIfFunction(partial(fig.success, response));
    //         response = response || {};
    //         self.setGlobalSuccess(response.successMessage);
    //         self.publish('success', response);
    //     },
    //     error: function (response) {
    //         // setTimeout(function () {
    //         callIfFunction(partial(fig.error, response));
    //         self.setFeedback(response);
    //         self.publish('error', response);

    //         // }, 500);
    //     },
    //     complete: function (response) {
    //         // setTimeout(function () {
    //         callIfFunction(fig.complete, response);
    //         self.enable();
    //         self.publish('complete', response);
    //         // }, 500);
    //     }
    // });

    return self;
};
