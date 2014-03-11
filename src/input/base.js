var createBaseInput = function (fig, my) {
    var self = mixinPubSub(),
        $self = fig.$;

    self.getType = function () {
        throw 'implement me (return type. "text", "radio", etc.)';
    };

    self.$ = function (selector) {
        return selector ? $self.find(selector) : $self;
    };

    self.disable = function () {
        self.$().prop('disabled', true);
        self.publish('isEnabled', false);
    };

    self.enable = function () {
        self.$().prop('disabled', false);
        self.publish('isEnabled', true);
    };

    return self;
};


var createInput = function (fig, my) {
    var self = createBaseInput(fig, my),
        fieldMap = fig.fieldMap || identity;

    self.get = function () {
        return self.$().val();
    };

    self.set = function (newValue) {
        var newMappedValue = fieldMap(newValue);
        var oldValue = self.get();
        if(oldValue !== newMappedValue) {
            self.$().val(newMappedValue);
            self.publish('change', newMappedValue);
        }
    };

    self.clear = function () {
        self.set('');
    };

    my.buildSetter = function (callback) {
        return function (newValue) {
            var newMappedValue = fieldMap(newValue);
            var oldValue = self.get();
            if(oldValue !== newMappedValue) {
                callback.call(self, newMappedValue);
                self.publish('change', newMappedValue);
            }
        };
    };

    return self;
};
