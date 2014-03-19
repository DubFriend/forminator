var createListItem = function (fig) {
    var self = mixinPubSub(),
        $self = fig.$self,
        fieldMap = fig.fieldMap || {},

        defaultMap = function (value) {
            return isArray(value) ? value.join(', ') : value;
        },

        render = function (fields) {
            foreach(fields, function (value, name) {
                $self.find('[data-field="' + name + '"]')
                    .html(fieldMap[name] ? fieldMap[name](value) : defaultMap(value));
            });
        },

        getFieldsFromDataValueAttribute = function () {
            var parseDataValue = function (value) {
                // does begin and end with brackets (denotes array of data)
                return (/^\[.*\]$/).test(value) ?
                    map(
                        // strip trailing and leading brackets and split on comma
                        value.replace(/^\[/, '').replace(/\]$/, '').split(','),
                        function (token) {
                            // String.trim() not available in ie8 and earlier.
                            return token.replace(/^\s*/, '').replace(/\s*$/, '');
                        }
                    ) : value;
            };
            var data = {};
            $self.find('[data-field]').each(function () {
                data[$(this).data('field')] = parseDataValue($(this).data('value')) || '';
            });
            return data;
        },

        fields = getFieldsFromDataValueAttribute();

    render(fields);

    self.set = function (newValues) {

        var bracketedKeys = map(newValues, identity, function (unbracketedName) {
            return inArray(keys(fields), unbracketedName + '[]') ?
                unbracketedName + '[]' : unbracketedName;
        });

        var changedFields = filter(bracketedKeys, function (newValue, name) {
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
        $self.find('[data-value]').attr('data-value', '');
        fields = map(fields, function () { return ''; });
        return self;
    };

    self.destroy = function () {
        $self.remove();
    };

    self.get = function () {
        return copy(fields);
    };

    self.addSelectedClass = function () {
        $self.addClass('selected');
    };

    self.removeSelectedClass = function () {
        $self.removeClass('selected');
    };

    $self.dblclick(function () {
        self.publish('selected', self);
    });

    $self.find('.frm-edit-item').click(function () {
        self.publish('selected', self);
    });

    $self.find('.frm-delete-item').click(function () {
        self.publish('delete', self);
    });

    return self;
};

