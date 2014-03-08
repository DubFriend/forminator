var forminator = {};

forminator.init = function (fig) {
    var factory = createFactory(fig),
        form = factory.form(),
        list = factory.list(),
        fieldMap = fig.fieldMap || {};


    if(list && form) {
        list.subscribe('selected', function (listItem) {
            form.set(map(listItem.get(), function (value, fieldName) {
                console.log(value, fieldName);
                return callIfFunction(fieldMap[fieldName], value) || value;
            }));
        });
    }


    return {
        form: form,
        list: list
    };
};

window.forminator = forminator;
