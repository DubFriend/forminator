module("list", {
    setup: function () {
        $('#qunit-fixture').html($('#forminator').html());
        var self = this;
        self.$self = $('.frm-list-name');
        self.list = createList({ $: self.$self });
    }
});

// test("initially leaves dom unchanged", function () {
test("initially renders data-value attributes into form", function () {
    var $items = this.$self.find('.frm-list-item');
    strictEqual($items.length, 1, 'one item');
    deepEqual(
        getListItemsData($items),
        { textarea: 'Default Value', 'checkbox[]': 'a, b', radio: 'a'},
        'checkbox rendered into form'
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

test("publishes listItem when selected", function () {
    expect(1);
    this.list.subscribe('selected', function (listItem) {
        deepEqual(
            filter(listItem.get(), function (value) {
                return value ? true : false;
            }),
            { 'checkbox[]': ['a', 'b'], radio: 'a', textarea: 'Default Value' },
            'passes list item (data is correct)'
        );
    });
    this.$self.find('.frm-list-item:first-child').dblclick();
});

test("publishes listItem when selected (set item)", function () {
    expect(1);
    this.list.set([{text: 'bar' }, { text: 'fad'}]);
    this.list.subscribe('selected', function (listItem) {
        deepEqual(
            filter(listItem.get(), function (value) {
                return value ? true : false;
            }),
            { text: 'bar' },
            'passes list item (data is correct)'
        );
    });
    this.$self.find('.frm-list-item:first-child').dblclick();
});

test("publishes listItem when selected (created set item)", function () {
    expect(1);
    this.list.set([{text: 'bar' }, { text: 'fad'}]);
    this.list.subscribe('selected', function (listItem) {
        deepEqual(
            filter(listItem.get(), function (value) {
                return value ? true : false;
            }),
            { text: 'fad' },
            'passes list item (data is correct)'
        );
    });
    this.$self.find('.frm-list-item:last-child').dblclick();
});

test("addSelected class listItem when selected", function () {
    this.list.set([{text: 'bar' }, { text: 'fad'}]);
    var $firstListItem = this.$self.find('.frm-list-item:first-child');
    var $secondListItem = this.$self.find('.frm-list-item:last-child');
    $firstListItem.dblclick();
    ok($firstListItem.hasClass('selected'), 'selected item has selected class');
    $secondListItem.dblclick();
    ok(!$firstListItem.hasClass('selected'), 'removes class from unselected items');
    ok($secondListItem.hasClass('selected'), 'adds class to selected item');
});
