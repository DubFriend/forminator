var createListItem = function (fig) {
    var self = {},
        $self = $self,
        fields = fig.fields || {},
        view = fig.view,
        render = function () {
            foreach(fields, function (value, name) {
                $self.find('[data-field="' + name + '"]').html(value);
            });
        };

    self.set = function (newValues) {
        fields = union(fields, newValues);
        render();
    };

    self.get = function () {
        return copy(fields);
    };

    return self;
};