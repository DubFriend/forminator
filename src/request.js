var createRequest = function (fig) {
    var self = mixinPubSub(),
        ajax = fig.ajax,
        url = fig.url,
        isHardREST = fig.isHardREST,
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
                self.publish('success', { data: response, action: 'get' });
            },
            error: function (jqXHR) {
                self.publish('error', { data: jqXHR.responseJSON, action: 'get' });
            },
            complete: function (jqXHR) {
                self.publish('complete', { data: jqXHR.responseJSON, action: 'get' });
            }
        });
    };

    self['delete'] = function (fig) {
        ajax({
            type: isHardREST ? 'DELETE' : 'POST',
            url: queryjs.set(url, union(
                fig.uniquelyIdentifyingFields,
                isHardREST ? {} : { action: 'delete' }
            )),
            dataType: 'json',
            success: function (response) {
                fig.success(response);
                self.publish('success', { data: response, action: 'delete' });
            },
            error: function (jqXHR) {
                callIfFunction(fig.error, jqXHR.responseJSON);
                self.publish('error', { data: jqXHR.responseJSON, action: 'delete' });
            },
            complete: function (jqXHR) {
                callIfFunction(fig.complete, jqXHR.responseJSON);
                self.publish('complete', { data: jqXHR.responseJSON, action: 'delete' });
            }
        });
    };

    return self;
};