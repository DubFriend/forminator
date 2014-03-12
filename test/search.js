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
            }
        });
    }
});

test('submit triggers seach', function () {
    this.$.submit();
    deepEqual(
        this.setFilterParameters, { select: 'a' },
        'request parameters set'
    );
    ok(this.searchIsCalled, 'request search is called');
});
