var createForm = function (fig) {
    var self = createFormBase(fig),
        ajax = fig.ajax,
        url = fig.url || fig.$.attr('action'),
        action = '',
        parameters = {},
        buildURL = function () {
            return action ? queryjs.set(url, union({ action: action }, parameters)) : url;
        };

    self.setAction = function (newAction) {
        action = newAction;
    };

    self.setParameters = function (newParameters) {
        if(isObject(newParameters)) {
            parameters = newParameters;
        }
        else {
            throw 'parameters must be an object';
        }
    };

    ajax(fig.$, function() {
        return {
            url: buildURL(),
            dataType: 'json',
            data: self.get(),

            validate: function () {
                var errors = self.validate(self.get());
                if(isEmpty(errors)) {
                    return true;
                }
                else {
                    self.setFeedback(errors);
                    self.publish('error', { data: errors, action: action });
                    return false;
                }
            },

            onprogress: function (e) {
                self.publish('onprogress', { data: e, action: action });
            },

            beforeSend: function () {
                self.disable();
                self.publish('beforeSend', { action: action });
            },

            success: function (response) {
                response = response || {};
                self.setGlobalSuccess(response.successMessage);
                self.publish('success', { data: response, action: action });
            },

            error: function (response) {
                // setTimeout(function () {
                self.setFeedback(response);
                self.publish('error', { data: response, action: action });
                // }, 500);
            },

            complete: function (response) {
                // setTimeout(function () {
                self.enable();
                self.publish('complete', { data: response, action: action });
                // }, 500);
            }
        };
    });


    return self;
};
