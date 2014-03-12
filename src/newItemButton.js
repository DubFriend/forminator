var createNewItemButton = function (fig) {
    var self = mixinPubSub(),
        $self = fig.$;

    $self.click(function () {
        self.publish('click');
    });

    return self;
};
