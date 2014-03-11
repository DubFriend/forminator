var createFactory = function (fig) {
    var self = {},
        url = fig.url,
        name = fig.name,
        $getModule = partial($getForminatorModule, name);

    var buildModuleIfExists = function (fn, name) {
        return function () {
            var args = argumentsToArray(arguments);
            var $module = $getModule(name);
            if($module.length) {
                return fn.apply(null, [$module].concat(args));
                // return fn($module);
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

    self.request = function () {
        return createRequest({
            ajax: function (fig) {
                $.ajax(fig);
            },
            url: url
        });
    };

    self.search = buildModuleIfExists(function ($module, request) {
        return createSearch({
            $: $module,
            request: request,
            inputs: map(
                buildFormInputs({ $: $module, factory: self }),
                function (input) {
                    return createFormGroup({ input: input });
                }
            )
        });
    }, 'search');

    return self;
};
