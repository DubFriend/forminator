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

        self.clearGlobalFeedback = function () {
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
            self.clearGlobalFeedback();
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

    self.setFeedback = function (feedback) {
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

    self.get = function () {
        return map(
            filter(inputs, function (input) {
                return !inArray(['file', 'button'], input.getType());
            }),
            function (input) {
                return input.get();
            }
        );
    };

    $self.submit(function (e) {
        e.preventDefault();
        var data = self.get(),
            errors = self.validate(data);

        self.clearFeedback();

        if(isEmpty(errors)) {
            ajax({
                url: url,
                method: 'POST',
                data: data,
                dataType: 'json',
                beforeSend: function () {
                    self.disable();
                    self.publish('beforeSend');
                },
                success: function (response) {
                    self.setGlobalSuccess(response.successMessage);
                    self.publish('success', response);
                },
                error: function (jqXHR) {
                    if(jqXHR.status === 409) {
                        self.setFeedback(jqXHR.responseJSON);
                        self.publish('error', jqXHR.responseJSON);
                    }
                },
                complete: function () {
                    // setTimeout(function () {
                    self.enable();
                    self.publish('complete');
                    // }, 500);
                }
            });
        }
        else {
            self.setFeedback(errors);
            self.publish('error', errors);
        }
    });

    return self;
};
