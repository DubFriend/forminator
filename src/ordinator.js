var createOrdinator = function (fig) {
    var self = {},
        $self = fig.$,
        request = fig.request,
        orderIcons = fig.orderIcons || {
            neutral: '&#8597;',
            ascending: '&#8593;',
            descending: '&#8595;'
        },
        fields = (function () {
            var fields = {};
            $self.find('[data-field]').each(function () {
                var $self = $(this);
                fields[$self.data('field')] = (function () {
                    var self = {},
                        $order = $self.is('[data-order]') ?
                            $self : $self.find('[data-order]'),
                        currentOrder = $order.data('order') || 'neutral';

                    self.set = function (order) {
                        $order.data('order', order);
                        $order.html(orderIcons[order]);
                        currentOrder = order;
                    };

                    self.get = function () {
                        return currentOrder;
                    };

                    self.next = function () {
                        var ordering = ['ascending', 'descending'],
                            nextOrder = ordering[
                                (indexOf(ordering, currentOrder) + 1) %
                                ordering.length
                            ];
                        self.set(nextOrder);
                    };

                    return self;
                }());
            });
            return fields;
        }());

    $self.find('[data-field]').click(function () {
        var fieldName = $(this).data('field');
        call(excludedSet(fields, [fieldName]), 'set', ['neutral']);
        fields[fieldName].next();
        request.setOrder(map(call(fields, 'get'), function (order) {
            return order === 'neutral' ? '' : order;
        }));
        request.setPage(1);
        request.search();
    });

    return self;
};
