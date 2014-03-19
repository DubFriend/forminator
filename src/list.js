var createList = function (fig) {
    var self = mixinPubSub(),
        fieldMap = fig.fieldMap || {},
        $self = fig.$,

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

            listItem.subscribe('delete', function () {
                self.publish('delete', listItem);
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

    return self;
};
