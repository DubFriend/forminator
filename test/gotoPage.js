module("gotoPage", {
    setup: function () {
        $('#qunit-fixture').html($('#forminator').html());
        var self = this;
        this.$gotoPage = $('.frm-goto-page-name');

        this.inputs = {
            page: {
                getType: function () { return 'text'; },
                get: function () {
                    return '5';
                }
            }
        };

        this.gotoPage = createGotoPage({
            $: this.$gotoPage,
            inputs: this.inputs
        });
    }
});

test('submit publishes submit with forms data', function () {
    expect(1);
    this.gotoPage.subscribe('submit', function (formData) {
        deepEqual(formData, { page: '5' });
    });
    this.$gotoPage.submit();
});
