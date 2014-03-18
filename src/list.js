var createList = function (fig) {
    var self = mixinPubSub(),
        fieldMap = fig.fieldMap || {},
        $self = fig.$,

        $itemTemplate = (function () {
            var $el = $self.find('.frm-list-item:first-child').clone();
            // use ListItems clear method to clean out the template.
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

    // erase old set, replace with given items
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

    // create a new list item element and add it to the beggining of the list
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
