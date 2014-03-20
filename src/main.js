var forminator = {};

forminator.init = function (fig) {
    var self = {},
        factory = createFactory(fig),
        form = factory.form(),
        newItemButton = factory.newItemButton(),
        request = factory.request(),
        list = factory.list(request),
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
        list.subscribe('deleted', function (listItem) {
            if(selectedItem === listItem) {
                self.reset();
            }
        });

        request.subscribe('success', function (response) {
            self.reset();
        });
    }

    return self;
};

window.forminator = forminator;
