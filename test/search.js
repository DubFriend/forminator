module("search", {
    setup: function () {
        $('#qunit-fixture').html($('#forminator').html());
        var self = this;
        this.$ = $('.frm-search-name');
        this.search = createSearch({
            $: this.$, request: {
                setFilter: function (data) {
                    self.setFilterParameters = data;
                },
                setPage: function (pageNumber) {
                    self.setPageParameters = pageNumber;
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
    strictEqual(this.setPageParameters, 1, 'set to page 1');
    ok(this.searchIsCalled, 'request search is called');
});
