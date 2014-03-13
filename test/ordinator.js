module("ordinator", {
    setup: function () {
        $('#qunit-fixture').html($('#forminator').html());
        var self = this;
        this.$ = $('#frm-ordinator-name');
        this.ordinator = createOrdinator({
            $: this.$, request: {
                setOrder: function (data) {
                    self.setFilterParameters = data;
                },
                search: function () {
                    self.searchIsCalled = true;
                }
            },
            orderIcons: {
                neutral: 'n',
                ascending: 'a',
                descending: 'd'
            }
        });

        this.getOrderable = function (fieldName) {
            var $orderable = self.getOrderableField(fieldName);
            return $orderable.is('[data-order]') ?
                $orderable : $orderable.find('[data-order]');
        };

        this.getOrderableField = function (fieldName) {
            return self.$.find('[data-field="' + fieldName + '"]');
        };
    }
});


test("click text toggle cycle", function () {
    var $orderable = this.getOrderable('text');
    var $field = this.getOrderableField('text');
    $orderable.click();
    strictEqual($orderable.data('order'), 'ascending', 'neutral to ascending');
});

// test('submit triggers seach', function () {
//     this.$.submit();
//     deepEqual(
//         this.setFilterParameters, { text: 'foo' },
//         'request parameters set to current input get values'
//     );
//     ok(this.searchIsCalled, 'request search is called');
// });
