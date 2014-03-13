module("search", {
    setup: function () {
        $('#qunit-fixture').html($('#forminator').html());
        var self = this;
        this.$ = $('#frm-search-name');
        this.search = createSearch({
            $: this.$, request: {
                setFilter: function (data) {
                    self.setFilterParameters = data;
                },
                search: function () {
                    self.searchIsCalled = true;
                }
            },
            inputs: {
                text: {
                    get: function () { return 'foo'; },
                    getType: function () { return 'text'; }
                }
            }
        });
    }
});

test('submit triggers seach', function () {
    this.$.submit();
    deepEqual(
        this.setFilterParameters, { text: 'foo' },
        'request parameters set to current input get'
    );
    ok(this.searchIsCalled, 'request search is called');
});
