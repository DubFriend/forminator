var forminator = {};

forminator.init = function (fig) {
    var self = {},
        uniquelyIdentifyingFields = fig.uniquelyIdentifyingFields,
        deleteConfirmation = fig.deleteConfirmation,
        factory = createFactory(fig),
        form = factory.form(),
        list = factory.list(),
        newItemButton = factory.newItemButton(),
        request = factory.request(),
        search = factory.search(request),
        ordinator = factory.ordinator(request),
        paginator = factory.paginator(request),

        selectedData = null,
        selectedItem = null;

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
        });

        form.subscribe('beforeSend', function () {
            selectedData = form.get();
        });

        form.subscribe('success', function () {
            if(selectedItem && selectedData) {
                selectedItem.set(selectedData);
            }
            else if(selectedData) {
                selectedItem = list.prepend(selectedData);
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

    if(list) {
        if(uniquelyIdentifyingFields) {
            list.subscribe('delete', function (listItem) {

                var deleteItem = function () {
                    var fields = subSet(listItem.get(), uniquelyIdentifyingFields);
                    // only send delete request if item has adequete
                    // uniquely identifiying information.
                    if(keys(fields).length === uniquelyIdentifyingFields.length) {
                        request.delete({
                            uniquelyIdentifyingFields: fields,
                            success: function (response) {
                                list.remove(listItem);
                                if(form) {
                                    form.reset();
                                }
                            },
                            error: function (response) {

                            },
                            complete: function (response) {

                            }
                        });
                    }
                };

                if(deleteConfirmation) {
                    deleteConfirmation(deleteItem);
                }
                else {
                    var isConfirmed = confirm(
                        'Are you sure you want to delete this item?'
                    );
                    if(isConfirmed) {
                        deleteItem();
                    }
                }

            });
        }

        request.subscribe('success', function (response) {
            self.reset();
            list.set(response ? response.results : []);
        });
    }

    return self;
};

window.forminator = forminator;
