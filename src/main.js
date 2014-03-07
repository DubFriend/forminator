var forminator = {};

forminator.init = function (fig) {
    var factory = createFactory(fig),
        form = factory.form(),
        list = factory.list();

    return {
        form: form,
        list: list
    };
};

window.forminator = forminator;
