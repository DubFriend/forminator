var createList = function (fig) {
    var self = mixinPubSub(),
        $self = fig.$,

        $itemTemplate = (function () {
            var $el = $self.find('.frm-list-item:first-child').clone();
            // use ListItems clear method to clean out the template.
            var listItem = createListItem({
                $self: $el
            });
            listItem.clear();
            return $el;
        }()),

        subscribeListItem = function (listItem) {
            listItem.subscribe('selected', function () {
                call(items, 'removeSelectedClass');
                listItem.addSelectedClass();
                self.publish('selected', listItem);
            });
            return listItem;
        },

        items = (function () {
            var items = [];
            $self.find('.frm-list-item').each(function () {
                items.push(subscribeListItem(createListItem({
                    $self: $(this)
                })));
            });
            return items;
        }());


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
                    $self: $new
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

    return self;
};
