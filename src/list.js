var createList = function (fig) {
    var self = mixinPubSub(),
        $self = fig.$,
        fieldMap = fig.fieldMap || {},
        deleteConfirmation = fig.deleteConfirmation,
        uniquelyIdentifyingFields = fig.uniquelyIdentifyingFields,
        request = fig.request,

        $itemTemplate = (function () {
            var $el = $self.find('.frm-list-item:first-child').clone();
            // Use the ListItem's clear method to clean out the template.
            var listItem = createListItem({
                $self: $el,
                fieldMap: fieldMap
            });
            listItem.clear();
            return $el;
        }()),

        subscribeListItem = function (listItem) {
            listItem.subscribe('selected', function () {
                self.setSelectedClass(listItem);
                self.publish('selected', listItem);
            });

            var deleteItem = function () {
                var fields = subSet(listItem.get(), uniquelyIdentifyingFields);
                request['delete']({
                    uniquelyIdentifyingFields: fields,
                    success: function (response) {
                        self.remove(listItem);
                        self.publish('deleted', listItem);
                    },
                    error: function (response) {

                    },
                    complete: function (response) {

                    }
                });
            };

            listItem.subscribe('delete', function () {
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

            return listItem;
        },

        items = (function () {
            var items = [];
            $self.find('.frm-list-item').each(function () {
                items.push(subscribeListItem(createListItem({
                    $self: $(this),
                    fieldMap: fieldMap
                })));
            });
            return items;
        }());

    self.setSelectedClass = function (listItem) {
        self.clearSelectedClass();
        listItem.addSelectedClass();
    };

    self.clearSelectedClass = function () {
        call(items, 'removeSelectedClass');
    };

    // Erase the old set, replace with the given items
    self.set = function (newItemsData) {
        var newElems = [];
        foreach(newItemsData, function(newItemData, index) {
            var $new;
            if(items[index]) {
                items[index].hardSet(newItemData);
            }
            else {
                $new = $itemTemplate.clone();
                newElems.push($new);
                items[index] = subscribeListItem(createListItem({
                    $self: $new,
                    fieldMap: fieldMap
                }));
                items[index].set(newItemData);
            }
        });

        $self.append(newElems);

        if(items.length > newItemsData.length) {
            call(
                items.splice(
                    newItemsData.length,
                    items.length - newItemsData.length
                ),
                'destroy'
            );
        }
    };

    self.remove = function (listItem) {
        if(indexOf(items, listItem) !== -1) {
            items.splice(indexOf(items, listItem), 1);
        }
        listItem.destroy();
    };

    // Create a new list item element and add it to the beggining of the list.
    self.prepend = function (newItemData) {
        var $new = $itemTemplate.clone();
        var newListItem = subscribeListItem(createListItem({
            $self: $new,
            fieldMap: fieldMap
        }));
        newListItem.set(newItemData);
        items.unshift(newListItem);
        $self.prepend($new);
        return newListItem;
    };

    request.subscribe('success', function (response) {
        self.set(
            isObject(response) && isArray(response.results) ?
                response.results : []
        );
    });

    return self;
};
