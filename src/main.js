var forminator = {};

forminator.init = function (fig) {
    var factory = createFactory(fig),
        form = factory.form(),
        list = factory.list(),
        newItemButton = factory.newItemButton(),
        request = factory.request(),
        search = factory.search(request),
        ordinator = factory.ordinator(request);

    form.setAction('create');

    if(list && form) {
        list.subscribe('selected', function (listItem) {
            form.set(listItem.get());
            form.setAction('update');
        });

        if(newItemButton) {
            newItemButton.subscribe('click', function () {
                form.reset();
                form.clearFeedback();
            });
        }
    }

    if(list) {
        request.subscribe('success', function (response) {
            console.log('request:success', response);
            list.set(response ? response.results : []);
        });
    }

    return {
        form: form,
        list: list
    };
};

window.forminator = forminator;
