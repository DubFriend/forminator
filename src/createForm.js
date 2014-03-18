var createForm = function (fig) {
    var self = createFormBase(fig),
        ajax = fig.ajax,
        url = fig.url || fig.$.attr('action');

    self.setAction = function (action) {
        url = queryjs.set(url, { action: action });
    };

    ajax(fig.$, function() {
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


    return self;
};
