var forminator = {};

forminator.init = function (fig) {

    var self = {};

    fig.validate = bind(fig.validate, self);

    var name = fig.name,
        uniquelyIdentifyingFields = fig.uniquelyIdentifyingFields,
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
                    applyUserFunction(fig[name], data.data, data.action);
                });
            }
        };

    self.reset = function () {
        if(form) {
            form.reset();
            if(list) {
                form.setAction('create');
            }
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
            form.clearSuccess();
        }
    };

    self.setFormParameters = function (parameters) {
        if(form) {
            form.setParameters(parameters);
        }
    };

    self.getFormData = function () {
        return copy(form.get());
    };

    if(list && form) {
        form.setAction('create');

        list.subscribe('selected', function (listItem) {
            form.set(listItem.get());
            form.setAction('update');
            selectedItem = listItem;
            self.clearFormFeedback();
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

    if(form && !list) {
        form.subscribe('success', function (response) {
            var results = response && response.data || {};
            form.set(results.fields || {});
            if(
                uniquelyIdentifyingFields &&
                doesContainKeys(form.get(), uniquelyIdentifyingFields)
            ) {
                form.setAction('update');
            }
        });
    }

    var $noResultsMessage = $('.frm-no-results-' + name);

    if(list) {
        list.subscribe('deleted', function (listItem) {
            if(selectedItem === listItem) {
                self.reset();
            }
        });

        // hide/show elements if no results (hide paginator if 0 or 1 pages).
        request.subscribe('success', function (response) {
            response = response || {};
            var results = response.data ? (response.data.results || []) : [];
            var numberOfPages = response.data ? toInt(response.data.numberOfPages) : 0;
            self.reset();
            if(results.length !== 0) {
                $noResultsMessage.hide();
            }
            else if(response.action === 'get') {
                $noResultsMessage.show();
            }

            if(paginator) {
                if(numberOfPages > 1) {
                    paginator.show();
                }
                else if(response.action === 'get') {
                    paginator.hide();
                }
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
