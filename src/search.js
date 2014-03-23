var createSearch = function (fig) {
    var self = createFormBase(fig),
        $self = fig.$,
        request = fig.request,
        isInstantSearch = fig.isInstantSearch,
        inputs = fig.inputs,
        search = function () {
            request.setFilter(self.get());
            request.setPage(1);
            request.search();
        };

    $self.submit(function (e) {
        e.preventDefault();
        search();
    });

    if(isInstantSearch) {
        foreach(inputs, function (input) {
            input.subscribe('change', search);
        });
    }

    return self;
};