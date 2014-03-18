module("ordinator", {
    setup: function () {
        $('#qunit-fixture').html($('#forminator').html());
        var self = this;
        this.$ = $('.frm-ordinator-name');
        this.ordinator = createOrdinator({
            $: this.$, request: {
                setOrder: function (data) {
                    self.setOrderParameters = data;
                },
                setPage: function (pageNumber) {
                    self.setPageParameters = pageNumber;
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

        var getOrderableField = function (fieldName) {
            return self.$.find('[data-field="' + fieldName + '"]');
        };

        var getOrderable = function (fieldName) {
            var $orderable = getOrderableField(fieldName);
            return $orderable.is('[data-order]') ?
                $orderable : $orderable.find('[data-order]');
        };

        this.$textOrderable = getOrderable('text');
        this.$textField = getOrderableField('text');
        this.$extraOrderable = getOrderable('extra');
        this.$extraField = getOrderableField('extra');
    }
});

test("click text toggle cycle text field", function () {
    this.$textField.click();
    strictEqual(this.$textOrderable.data('order'), 'descending', 'ascending to descending');
    strictEqual(this.$textOrderable.html(), 'd', 'html set');
    this.$textField.click();
    strictEqual(this.$textOrderable.data('order'), 'ascending', 'neutral to ascending');
    strictEqual(this.$textOrderable.html(), 'a', 'html set ascending');
    this.$textField.click();
    strictEqual(this.$textOrderable.data('order'), 'descending', 'ascending to descending');
    strictEqual(this.$textOrderable.html(), 'd', 'html set');
});

test("click text toggle cycle extra field", function () {
    this.$extraField.click();
    strictEqual(this.$extraOrderable.data('order'), 'ascending', 'neutral to ascending');
    strictEqual(this.$extraOrderable.html(), 'a', 'html set ascending');
    this.$extraField.click();
    strictEqual(this.$extraOrderable.data('order'), 'descending', 'ascending to descending');
    strictEqual(this.$extraOrderable.html(), 'd', 'html set');
    this.$extraField.click();
    strictEqual(this.$extraOrderable.data('order'), 'ascending', 'neutral to ascending');
    strictEqual(this.$extraOrderable.html(), 'a', 'html set ascending');
});

test("sets other fields to neutral", function () {
    this.$extraField.click();
    strictEqual(this.$textOrderable.data('order'), 'neutral', 'data-order set to neutral');
    strictEqual(this.$textOrderable.html(), 'n', 'html set');
});

test("sets request.setOrder on click (sets neutral to empty string)", function () {
    this.$textField.click();
    deepEqual(this.setOrderParameters, { text: 'descending', extra: '' });
});

test("sets page to 1 on click", function () {
    this.$textField.click();
    strictEqual(this.setPageParameters, 1);
});

test("sets request.search() called on click", function () {
    this.$textField.click();
    ok(this.searchIsCalled);
});
