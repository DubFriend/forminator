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
                return false;
            }
            else  {
                return fields[name] !== newValue;
            }
        });
        fields = union(fields, changedFields);
        render(changedFields);
        return self;
    };

    // sets new values and clears any absent fields
    self.hardSet = function (newValues) {
        self.clear();
        self.set(newValues);
    };

    self.clear = function () {
        $self.find('[data-field]').html('');
        return self;
    };

    self.destroy = function () {
        $self.remove();
    };

    self.get = function () {
        return copy(fields);
    };

    return self;
};

