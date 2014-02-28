var forminator = {};

forminator.init = function (fig) {
    var factory = createFactory(fig),
        form = factory.form();

    return form;
};

window.forminator = forminator;
