var createForm = function (fig) {
    var self = {},
        $self = fig.$,
        url = fig.url,
        inputs = fig.inputs;

    $self.submit(function (e) {
        e.preventDefault();
        $.ajax({
            url: url,
            method: 'POST',
            data: { foo: 'bar' },
            dataType: 'json',
            beforeSend: function () {
                console.log('beforeSend');
            },
            success: function (response) {
                console.log('success', response);
            },
            error: function () {
                console.log('error');
            },
            complete: function () {
                console.log('complete');
            }
        });
        console.log('submit');
    });

    return self;
};
