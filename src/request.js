var createRequest = function (fig) {
    var self = mixinPubSub(),
        ajax = fig.ajax,
        url = fig.url,
        data = {},
        buildURL = function () {
            var strippedData = map(data || {}, identity, function (key) {
                return key.replace(/\[\]$/, '');
            });
            return queryjs.set(url, filter(strippedData, function (value) {
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
            error: function (jqXHR) {
                self.publish('error', jqXHR.responseJSON);
            },
            complete: function (jqXHR) {
                console.log('complete', jqXHR.responseJSON);
                self.publish('complete', jqXHR.responseJSON);
            }
        });
    };

    return self;
};