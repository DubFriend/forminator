var createForm = function (fig) {
    var self = mixinPubSub(),
        $self = fig.$,
        ajax = fig.ajax,
        url = fig.url,
        inputs = fig.inputs;

    self.disable = function () {
        call(inputs, 'disable');
    };

    self.enable = function () {
        call(inputs, 'enable');
    };

    self.validate = function (data) {
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

        if(isEmpty(errors)) {
            ajax({
                url: url,
                method: 'POST',
                data: data,
                dataType: 'json',
                beforeSend: function () {
                    self.disable();
                    // console.log('beforeSend');
                },
                success: function (response) {
                    // console.log('success', response);
                },
                error: function (jqXHR) {
                    console.log('error');
                    if(jqXHR.status === 409) {
                        self.publish('error', jqXHR.responseJSON);
                    }
                },
                complete: function () {
                    // setTimeout(function () {
                    self.enable();
                    // }, 2000);
                    // console.log('complete');
                }
            });
            // console.log('submit');
        }
        else {
            console.log('error', errors);
        }
    });

    return self;
};
