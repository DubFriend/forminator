module("listItem", {
    setup: function () {
        $('#qunit-fixture').html($('#forminator').html());
        var self = this;
        self.$self = $('#frm-list-container-name .frm-list-item:first-child');
        self.listItem = createListItem({ $self: self.$self });
        self.defaultFieldValues = {
            checkbox: '', extra: '', hidden: '', radio: '', select: '', text: '',
            textarea: 'Default Value'
        };
        console.warn = function (message) {
            self.warnMessage = message;
        };
    }
});

test("populates initial data from html", function () {
    deepEqual(this.listItem.get(), this.defaultFieldValues);
});

test("set then get", function () {
    this.listItem.set({ checkbox: 'foo' });
    deepEqual(
        this.listItem.get(),
        union(this.defaultFieldValues, { checkbox: 'foo' })
    );
});

test("set renders new values", function () {
    this.listItem.set({ checkbox: 'foo' });
    strictEqual(this.$self.find('[data-field="checkbox"]').html(), 'foo');
});

test("try to set non existant field does not set value", function () {
    this.listItem.set({ wrong: 'foo' });
    deepEqual(this.listItem.get(), this.defaultFieldValues);
});

test("try to set non existant field issues a console.warn message", function () {
    this.listItem.set({ wrong: 'foo' });
    strictEqual(
        this.warnMessage,
        'field of value wrong does not exist on this list item.'
    );
});
