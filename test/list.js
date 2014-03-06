module("list", {
    setup: function () {
        $('#qunit-fixture').html($('#forminator').html());
        var self = this;
        self.$self = $('#frm-list-container-name');
        self.list = createList({ $self: self.$self });
    }
});

test("initially leaves dom unchanged", function () {
    var $items = this.$self.find('.frm-list-item');
    strictEqual($items.length, 1, 'one item');
    deepEqual(
        getListItemsData($items),
        { textarea: 'Default Value' },
        'value unchanged'
    );
});

test("set creates new element", function () {
    this.list.set([{ text: 'foo' }, { text: 'bar', select: 'fooz' }]);
    var $items = this.$self.find('.frm-list-item');
    strictEqual($items.length, 2, 'two list items rendered');
    deepEqual(getListItemsData($($items[0])), { text: 'foo' });
    deepEqual(getListItemsData($($items[1])), { text: 'bar', select: 'fooz' });
});

test("set, removes excess elements", function () {
    this.list.set([{ text: 'a'}, { text: 'b' }, { text: 'c' }]);
    this.list.set([{ text: 'foo' }]);
    var $items = this.$self.find('.frm-list-item');
    strictEqual($items.length, 1, 'only one item');
    deepEqual(getListItemsData($items), { text: 'foo' }, 'data is set');
});
