module("search", {
    setup: function () {
        $('#qunit-fixture').html($('#forminator').html());
        var self = this;
        self.$self = $('#frm-search-name');
        // self.listItem = createListItem({ $self: self.$self });
        // self.defaultFieldValues = {
        //     'checkbox[]': '', extra: '', hidden: '', id: '',
        //     'radio': '', select: '', text: '',
        //     textarea: 'Default Value'
        // };
    }
});
