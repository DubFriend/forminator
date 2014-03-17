module("gotoPage", {
    setup: function () {
        $('#qunit-fixture').html($('#forminator').html());
        var self = this;
        this.$gotoPage = $('.frm-goto-page-name');

        this.errorMessages = {
            noPage: "noPage message",
            notAnInteger: "notAnInteger message",
            nonPositiveNumber: "nonPositiveNumber message"
        };

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
            inputs: this.inputs,
            errorMessages: this.errorMessages
        });
    }
});

test('validate success, max page same as page', function () {
    deepEqual(this.gotoPage.validate({ page: '5' }, 5), {});
});

test('validate success, max page greater than page', function () {
    deepEqual(this.gotoPage.validate({ page: '5' }, 6), {});
});

test('validate fail, page greater than max page', function () {
    deepEqual(this.gotoPage.validate({ page: '5'}, 4), {
        page: "Page number cannot exceed the total number of pages."
    });
});

test('validate fail, page nonPositiveNumber', function () {
    deepEqual(this.gotoPage.validate({ page: '0'}, 4), {
        page: this.errorMessages.nonPositiveNumber
    });
});

test('validate fail, page notAnInteger', function () {
    deepEqual(this.gotoPage.validate({ page: 'a'}, 4), {
        page: this.errorMessages.notAnInteger
    });
});

test('validate fail, page noPage', function () {
    deepEqual(this.gotoPage.validate({}, 4), {
        page: this.errorMessages.noPage
    });
});

test('submit publishes submit with forms data', function () {
    expect(1);
    this.gotoPage.subscribe('submit', function (formData) {
        deepEqual(formData, { page: '5' });
    });
    this.$gotoPage.submit();
});
