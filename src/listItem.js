var createListItem = function (fig) {
    var self = mixinPubSub(),
        fieldMap = fig.fieldMap || {},
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
        var mappedNewValues = map(newValues, function (value, name) {
            return fieldMap[name] ? fieldMap[name](value) : value;
        });

        var changedFields = filter(mappedNewValues, function (newValue, name) {
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
        fields = map(fields, function () { return ''; });
        return self;
    };

    self.destroy = function () {
        $self.remove();
    };

    self.get = function () {
        return copy(fields);
    };

    (function () {
        var hasSelectedClass = false;
        self.addSelectedClass = function () {
            if(!hasSelectedClass) {
                $self.addClass('selected');
            }
            hasSelectedClass = true;
        };

        self.removeSelectedClass = function () {
            if(hasSelectedClass) {
                $self.removeClass('selected');
            }
            hasSelectedClass = false;
        };
    }());

    $self.dblclick(function () {
        self.publish('selected', self);
    });

    return self;
};

