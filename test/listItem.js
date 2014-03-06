module("listItem", {
    setup: function () {
        $('#qunit-fixture').html($('#forminator').html());
        var self = this;
        self.$self = $('#frm-list-container-name .frm-list-item:first-child');
        self.listItem = createListItem({ $self: self.$self });
        self.defaultFieldValues = {
            checkbox: '', extra: '', hidden: '',
            radio: '', select: '', text: '',
            textarea: 'Default Value'
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

test("hard set", function () {
    this.listItem.hardSet({ text: 'foo' });
    deepEqual(getListItemsData(this.$self), { text: 'foo' }, 'old fields are erased');
});

test("set renders new values", function () {
    this.listItem.set({ checkbox: 'foo' });
    strictEqual(this.$self.find('[data-field="checkbox"]').html(), 'foo');
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
