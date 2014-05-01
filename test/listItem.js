module("listItem", {
    setup: function () {
        $('#qunit-fixture').html($('#forminator').html());
        var self = this;
        self.$self = $('.frm-list-name .frm-list-item:first-child');
        self.listItem = createListItem({
            $self: self.$self
        });
        self.defaultFieldValues = {
            'checkbox[]': ['a', 'b'], extra: '', hidden: '', id: '',
            'radio': 'a', select: '', text: '',
            textarea: 'Default Value'
        };
    }
});

test("populates initial data from data-value attribute", function () {
    deepEqual(this.listItem.get(), this.defaultFieldValues);
});

test("set then get", function () {
    this.listItem.set({ 'checkbox[]': 'foo' });
    deepEqual(
        this.listItem.get(),
        union(this.defaultFieldValues, { 'checkbox[]': 'foo' })
    );
});

test("hard set", function () {
    this.listItem.hardSet({ text: 'foo' });
    deepEqual(getListItemsData(this.$self), { text: 'foo' }, 'old fields are erased');
});

test("set fieldMap", function () {
    var listItem = createListItem({
        $self: this.$self, fieldMap: {
            text: function (value) {
                return value.toUpperCase();
            }
        }
    });
    listItem.set({ text: 'foo', textarea: 'bar' });
    deepEqual(
        getListItemsData(this.$self),
        {'checkbox[]': 'a, b', radio: 'a', text: 'FOO', textarea: 'bar' },
        'field is mapped on set'
    );
});

test("hardSet fieldMap", function () {
    var listItem = createListItem({
        $self: this.$self, fieldMap: {
            text: function (value) {
                return value.toUpperCase();
            }
        }
    });
    listItem.hardSet({ text: 'foo', textarea: 'bar' });
    deepEqual(
        getListItemsData(this.$self),
        { text: 'FOO', textarea: 'bar' },
        'field is mapped on set'
    );
});

test("fieldMap is passed all values as second parameter", function () {
    var secondParameter;
    var listItem = createListItem({
        $self: this.$self, fieldMap: {
            text: function (value, allValues) {
                secondParameter = allValues;
            }
        }
    });
    listItem.hardSet({ text: 'foo', textarea: 'bar' });
    deepEqual(secondParameter, { text: 'foo', textarea: 'bar' });
});

test("default fieldMap joins array (hardSet)", function () {
    this.listItem.hardSet({ 'text': ['a', 'b'] });
    deepEqual(getListItemsData(this.$self), { text: 'a, b' });
});

test("set renders new values", function () {
    this.listItem.set({ 'checkbox[]': 'foo' });
    strictEqual(this.$self.find('[data-field="checkbox[]"]').html(), 'foo');
});

test("set corrects unbracketed name that should be bracketed", function () {
    this.listItem.set({ checkbox: ['a', 'b']});
    strictEqual(this.$self.find('[data-field="checkbox[]"]').html(), 'a, b');
});

test("set non existant field does not set value", function () {
    this.listItem.set({ wrong: 'foo' });
    deepEqual(this.listItem.get(), this.defaultFieldValues);
});



test("clear", function () {
    this.listItem.clear();
    this.$self.find('[data-field]').each(function () {
        strictEqual($(this).html(), '');
    });
});

test("destroy", function () {
    this.listItem.destroy();
    strictEqual(
        $('#frm-list-container-name .frm-list-item:first-child').length, 0
    );
});

test("setSelected", function () {
    this.listItem.addSelectedClass();
    ok(this.$self.hasClass('selected'), 'has class "selected"');
});

test("clearSelected", function () {
    this.listItem.addSelectedClass();
    this.listItem.removeSelectedClass();
    ok(!this.$self.hasClass('selected'), 'does not have class "selected"');
});

test("double click publishes selected event", function () {
    expect(1);
    var self = this;
    this.listItem.subscribe('selected', function (listItem) {
        deepEqual(listItem, self.listItem, 'passes in listItem object');
    });
    this.$self.dblclick();
});

test("click .frm-edit-item publishes selected event", function () {
    expect(1);
    var self = this;
    this.listItem.subscribe('selected', function (listItem) {
        deepEqual(listItem, self.listItem, 'passes in listItem object');
    });
    this.$self.find('.frm-edit-item').click();
});

test("click .frm-delete-item publishes delete event", function () {
    expect(1);
    var self = this;
    this.listItem.subscribe('delete', function (listItem) {
        deepEqual(listItem, self.listItem, 'passes in listItem object');
    });
    this.$self.find('.frm-delete-item').click();
});
