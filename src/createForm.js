var createForm = function (fig) {
    var self = createFormBase(fig),
        inputs = fig.inputs || {},
        ajax = fig.ajax,
        url = fig.url || fig.$.attr('action'),
        isHardREST = fig.isHardREST,
        action = '',
        parameters = {},
        buildURL = function () {
            return action ?
            queryjs.set(url, union(
                isHardREST ? {} : { action: action },
                parameters
            )) : url;
        },
        fieldValidators = fig.fieldValidators || {};

    var getRESTMethod = function () {
        var map = {
            'get': 'GET',
            'update': 'PUT',
            'create': 'POST',
            'delete': 'DELETE'
        };
        return action ? map[action] : '';
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
            type: isHardREST ? getRESTMethod() : 'POST',
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
                self.setFeedback(response);
                self.publish('error', { data: response, action: action });
            },

            complete: function (response) {
                self.enable();
                self.publish('complete', { data: response, action: action });
            }
        };
    });

    foreach(inputs, function (input, name) {
        input.subscribe('validate', function () {
            var error = null;

            if(fieldValidators[name]) {
                error = fieldValidators[name](input.get());
            }

            if(error) {
                if(error.isSuccess) {
                    input.setSuccess(error.message || '');
                }
                else {
                    input.setFeedback(error.message || '');
                }
            }
        });
    });

    return self;
};
