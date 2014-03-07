var createFactory = function (fig) {
    var self = {},
        url = fig.url,
        name = fig.name,
        $getModule = partial($getForminatorModule, name);

    var buildModuleIfExists = function (fn, name) {
        return function () {
            var $module = $getModule(name);
            if($module.length) {
                return fn($module);
            }
        };
    };

    self.input = {
        text: createInputText,
        textarea: createInputTextarea,
        select: createInputSelect,
        radio: createInputRadio,
        checkbox: createInputCheckbox,
        file: createInputFile,
        button: createInputButton,
        hidden: createInputHidden
    };

    self.form = buildModuleIfExists(function ($module) {
        return createForm({
            $: $module,
            ajax: ajax,
            validate: fig.validate,
            onprogress: fig.onprogress,
            success: fig.success,
            error: fig.error,
            complete: fig.complete,
            url: url,
            inputs: map(
                buildFormInputs({ $: $module, factory: self }),
                function (input) {
                    return createFormGroup({ input: input });
                }
            )
        });
    });

    self.list = buildModuleIfExists(function ($module) {
        return createList({ $: $module });
    }, 'list');

    return self;
};
