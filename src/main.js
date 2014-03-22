var forminator = {};

forminator.init = function (fig) {

    var self = {};

    fig.validate = bind(fig.validate, self);

    var name = fig.name,
        factory = createFactory(fig),
        form = factory.form(),
        newItemButton = factory.newItemButton(),
        request = factory.request(),
        list = factory.list(request),
        search = factory.search(request),
        ordinator = factory.ordinator(request),
        paginator = factory.paginator(request),

        selectedData = null,
        selectedItem = null,

        applyUserFunction = function (fn) {
            if(isFunction(fn)) {
                fn.apply(self, Array.prototype.slice.call(arguments, 1));
            }
        },

        subscribeUserToAjaxEvent = function (object, name) {
            if(object) {
                object.subscribe(name, function (data) {
                    applyUserFunction(fig[name], data.action, data.data);
                });
            }
        };

    self.reset = function () {
        if(form) {
            form.reset();
            form.setAction('create');
        }
        if(list) {
            list.clearSelectedClass();
        }
        selectedItem = null;
        selectedData = null;
    };

    self.clearFormFeedback = function () {
        if(form) {
            form.clearFeedback();
        }
    };

    form.setAction('create');

    if(list && form) {
        list.subscribe('selected', function (listItem) {
            form.set(listItem.get());
            form.setAction('update');
            selectedItem = listItem;
            applyUserFunction(fig.selected, listItem.get$());
        });

        form.subscribe('beforeSend', function () {
            selectedData = form.get();
        });

        form.subscribe('success', function (response) {
            response = response || {};
            var results = response.data || {};
            if(selectedItem && selectedData) {
                selectedItem.set(selectedData);
            }
            else if(selectedData) {
                selectedItem = list.prepend(union(selectedData, results.fields || {}));
                list.setSelectedClass(selectedItem);
            }
            self.reset();
        });

        if(newItemButton) {
            newItemButton.subscribe('click', function () {
                self.reset();
                self.clearFormFeedback();
            });
        }
    }

    var $noResultsMessage = $('.frm-no-results-' + name);

    if(list) {
        list.subscribe('deleted', function (listItem) {
            if(selectedItem === listItem) {
                self.reset();
            }
        });

        request.subscribe('success', function (response) {
            response = response || {};
            self.reset();
            if(
                isObject(response.data) &&
                isArray(response.data.results) &&
                response.data.results.length !== 0
            ) {
                $noResultsMessage.hide();
            }
            else if(response.action !== 'delete') {

                $noResultsMessage.show();
            }

        });
    }

    subscribeUserToAjaxEvent(form, 'onprogress');
    subscribeUserToAjaxEvent(form, 'success');
    subscribeUserToAjaxEvent(form, 'error');
    subscribeUserToAjaxEvent(form, 'complete');
    subscribeUserToAjaxEvent(request, 'success');
    subscribeUserToAjaxEvent(request, 'error');
    subscribeUserToAjaxEvent(request, 'complete');

    return self;
};

window.forminator = forminator;
