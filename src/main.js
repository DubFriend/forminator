var forminator = {};

forminator.init = function (fig) {
    var factory = createFactory(fig),
        form = factory.form(),
        list = factory.list(),
        request = factory.request(),
        search = factory.search(request),
        fieldMap = fig.fieldMap || {};

    form.setAction('create');

    if(list && form) {
        list.subscribe('selected', function (listItem) {
            form.set(map(listItem.get(), function (value, fieldName) {
                console.log(value, fieldName);
                return callIfFunction(fieldMap[fieldName], value) || value;
            }));
            form.setAction('update');
        });
    }


    return {
        form: form,
        list: list
    };
};

window.forminator = forminator;
