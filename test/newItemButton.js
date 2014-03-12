module("newItemButton", {
    setup: function () {
        $('#qunit-fixture').html($('#forminator').html());
        var self = this;
        self.$self = $('.frm-new-name');
        self.newItemButton = createNewItemButton({ $: self.$self });
    }
});

test('click publishes click event', function () {
    expect(1);
    this.newItemButton.subscribe('click', function () {
        ok(true, 'click event published');
    });
    this.$self.click();
});
