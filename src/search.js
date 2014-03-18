var createSearch = function (fig) {
    var self = createFormBase(fig),
        $self = fig.$,
        request = fig.request;

    $self.submit(function (e) {
        e.preventDefault();
        request.setFilter(self.get());
        request.setPage(1);
        request.search();
    });

    return self;
};