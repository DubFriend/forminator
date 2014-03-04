var createRequest = function (fig) {
    var self = mixinPubSub(),
        ajax = fig.ajax,
        url = fig.url,
        data = {},
        buildURL = function () {
            return queryjs.set(url, filter(data, function (value) {
                return value || value === 0;
            }));
        },
        set = function (values) {
            data = union(data, values);
        };

    self.setOrder = function (values) {
        set(map(values, identity, function (key) {
            return 'order_' + key;
        }));
    };

    self.setFilter = function (values) {
        set(map(values, identity, function (key) {
            return 'filter_' + key;
        }));
    };

    self.search = function () {
        ajax({
            type: 'GET',
            url: buildURL(),
            success: function (response) {
                self.publish('success', response);
            },
            error: function (response) {
                self.publish('error', response);
            },
            complete: function (response) {
                self.publish('complete', response);
            }
        });
    };

    return self;
};