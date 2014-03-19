var createRequest = function (fig) {
    var self = mixinPubSub(),
        ajax = fig.ajax,
        url = fig.url,
        data = {},
        buildURL = function () {
            return queryjs.set(url, filter(data || {}, function (value) {
                // only return non empty arrays and non falsey values (except 0)
                return isArray(value) ? value.length : value || value === 0;
            }));
        },
        set = function (values) {
            data = union(data, values);
        };

    self.setOrder = function (values) {
        set(map(values, identity, function (key) {
            return 'order_' + (isArray(key) ? key.join(',') : key);
        }));
    };

    self.setFilter = function (values) {
        set(map(values, identity, function (key) {
            return 'filter_' + (isArray(key) ? key.join(',') : key);
        }));
    };

    self.setPage = function (pageNumber) {
        set({ page: pageNumber });
        self.publish('setPage', pageNumber);
    };

    self.search = function () {
        ajax({
            type: 'GET',
            url: buildURL(),
            dataType: 'json',
            success: function (response) {
                self.publish('success', response);
            },
            error: function (jqXHR) {
                self.publish('error', jqXHR.responseJSON);
            },
            complete: function (jqXHR) {
                self.publish('complete', jqXHR.responseJSON);
            }
        });
    };

    self['delete'] = function (fig) {
        ajax({
            type: 'POST',
            url: queryjs.set(
                url, union(fig.uniquelyIdentifyingFields, { action: 'delete' })
            ),
            dataType: 'json',
            success: fig.success,
            error: function (jqXHR) {
                callIfFunction(fig.error, jqXHR.responseJSON);
            },
            complete: function (jqXHR) {
                callIfFunction(fig.complete, jqXHR.responseJSON);
            }
        });
    };

    return self;
};