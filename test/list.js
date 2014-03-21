module("list", {
    setup: function () {
        $('#qunit-fixture').html($('#forminator').html());
        var self = this;
        this.$self = $('.frm-list-name');
        this.$self.find('[data-field="id"]').attr('data-value', '1');
        this.request = mixinPubSub({
            'delete': function (deleteFig) {
                self.request.deleteParameters = deleteFig;
            }
        });
        this.list = createList({
            $: this.$self,
            request: this.request,
            uniquelyIdentifyingFields: ['id'],

            deleteConfirmation: function (deleteItem) {
                if(self.list.isDelete) {
                    deleteItem();
                }
            }
        });
        // isDelete parameter for testing only
        this.list.isDelete = true;
    }
});

test("sets on request success", function () {
    this.request.publish('success',{ action: 'get', data: { results: [{ id: 2 }, { id: 3 }]} });
    var $items = this.$self.find('.frm-list-item');
    strictEqual($items.length, 2, 'two items rendered');
    deepEqual(getListItemsData($($items[0])), { id: '2' }, 'first item rendered');
    deepEqual(getListItemsData($($items[1])), { id: '3' }, 'second item rendered');
});

test("sets on request success, no results", function () {
    this.request.publish('success', { action: 'get' });
    var $items = this.$self.find('.frm-list-item');
    strictEqual($items.length, 0, 'zero items rendered');
});

test("click listItem's delete calls request.delete", function () {
    this.$self.find('.frm-delete-item').click();
    deepEqual(
        this.request.deleteParameters.uniquelyIdentifyingFields, { 'id': 1 },
        'request is given the uniquelyIdentifyingFields'
    );
    strictEqual(
        this.$self.find('.frm-list-item').length, 1,
        'list item not yet deleted'
    );
    this.request.deleteParameters.success();
    strictEqual(
        this.$self.find('.frm-list-item').length, 0,
        'list item deleted on success'
    );
});

test("does not delete if delete confirmation does not call callback", function () {
    this.list.isDelete = false;
    this.$self.find('.frm-delete-item').click();
    strictEqual(this.request.deleteParameters, undefined);
});

test("publishes deleted listItem on delete success", function () {
    expect(1);
    this.$self.find('.frm-delete-item').click();
    this.list.subscribe('deleted', function (listItem) {
        deepEqual(listItem.get(), {
            'checkbox[]': ['a', 'b'], extra: "", hidden: "",
            id: 1, radio: "a", select: "", text: "",
            textarea: "Default Value"
        }, 'publishes "deleted" event with deleted listItem');
    });
    this.request.deleteParameters.success();
});

test("initially renders data-value attributes into form", function () {
    var $items = this.$self.find('.frm-list-item');
    strictEqual($items.length, 1, 'one item');
    deepEqual(
        getListItemsData($items),
        { textarea: 'Default Value', 'checkbox[]': 'a, b', radio: 'a', id: '1' },
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
    strictEqual($items.length, 1, 'dom only one item');
    deepEqual(getListItemsData($items), { text: 'foo' }, 'dom data is set');
});

test("prepend", function () {
    var listItem = this.list.prepend({ text: 'foo' });
    deepEqual(listItem.get(), {
        "checkbox[]": '', extra: '', hidden: '',
        id: '', radio: '', select: '',
        text: 'foo', textarea: ''
    }, 'returns new list item');
    var $items = this.$self.find('.frm-list-item');
    strictEqual($items.length, 2, 'two items in dom');
    deepEqual(getListItemsData($($items[0])), { text: 'foo' }, 'dom data set');
});

test("publishes listItem when selected", function () {
    expect(1);
    this.list.subscribe('selected', function (listItem) {
        deepEqual(
            filter(listItem.get(), function (value) {
                return value ? true : false;
            }),
            { 'checkbox[]': ['a', 'b'], radio: 'a', textarea: 'Default Value', id: 1 },
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

test("clearSelected", function () {
    var $items = this.$self.find('.frm-list-item');
    $items.addClass('selected');
    this.list.clearSelectedClass();
    ok(!$items.hasClass('selected'), 'selected class removed');
});

test("setSelected", function () {
    var $originalItems = this.$self.find('.frm-list-item');
    $originalItems.addClass('selected');
    var listItem = this.list.prepend({ text: 'foo' });
    this.list.setSelectedClass(listItem);
    ok(
        !$originalItems.hasClass('selected'),
        'selected class cleared from previously selected item'
    );
    ok(
        this.$self.find('.frm-list-item').hasClass('selected'),
        'new item has selected class'
    );
});
