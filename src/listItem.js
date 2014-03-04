var createListItem = function (fig) {
    var self = {},
        $self = fig.$self,

        render = function (fields) {
            foreach(fields, function (value, name) {
                $self.find('[data-field="' + name + '"]').html(value);
            });
        },

        getFieldsFromHTML = function () {
            var data = {};
            $self.find('[data-field]').each(function () {
                data[$(this).attr('data-field')] = $(this).html();
            });
            return data;
        },

        fields = getFieldsFromHTML();

    self.set = function (newValues) {
        var changedFields = filter(newValues, function (newValue, name) {
            if(typeof fields[name] === 'undefined') {
                console.warn(
                    'field of value ' + name +
                    ' does not exist on this list item.'
                );
                return false;
            }
            else  {
                return fields[name] !== newValue;
            }
        });
        fields = union(fields, changedFields);
        render(changedFields);
    };

    self.get = function () {
        return copy(fields);
    };

    return self;
};