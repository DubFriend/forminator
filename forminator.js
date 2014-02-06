// forminator version 0.0.0
// https://github.com/DubFriend/forminator
// (MIT) 06-02-2014
// Brian Detering <BDeterin@gmail.com> (http://www.briandetering.net/)
(function () {
'use strict';

var createInput = function (fig) {
    var self = mixinPubSub(),
        $self = fig.$;

    self.$ = function (selector) {
        return selector ? $self.find(selector) : $self;
    };

    self.get = function () {
        return self.$().val();
    };

    self.set = function (newValue) {
        var oldValue = self.get();
        if(oldValue !== newValue) {
            self.$().val(newValue);
            self.publish('change', newValue);
        }
    };

    return self;
};

var createInputText = function (fig) {
    var self = createInput(fig);

    self.getType = function () {
        return 'text';
    };

    return self;
};


var buildFormElements = function (fig) {
    var $self = fig.$,
        factory = fig.factory,
        inputs = {};

    $self.find('input[type="text"]').each(function () {
        inputs[$(this).attr('name')] = factory.input.text({ $: $(this) });
    });

    return inputs;
};

}());
