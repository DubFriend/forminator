var createGotoPage = function (fig) {
    var self = createFormBase(fig),
        $self = fig.$;

    $self.submit(function (e) {
        e.preventDefault();
        self.publish('submit', self.get());
    });

    return self;
};
