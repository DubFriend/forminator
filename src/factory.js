var createFactory = function (fig) {
    var self = {},
        url = fig.url,
        name = fig.name,
        fieldMap = fig.fieldMap || {},
        $getModule = partial($getForminatorModule, name);

    var getMapToHTML = function () {
        return map(fieldMap, function (object) {
            return object && object.toHTML;
        });
    };

    var getMapFromHTML = function () {
        return map(fieldMap, function (object) {
            return object && object.fromHTML;
        });
    };

    var buildModuleIfExists = function (fn, name) {
        return function () {
            var args = argumentsToArray(arguments);
            var $module = $getModule(name);
            if($module.length) {
                return fn.apply(null, [$module].concat(args));
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
                buildFormInputs({
                    $: $module,
                    factory: union(self, { fieldMap: getMapFromHTML() })
                }),
                function (input) {
                    return createFormGroup({ input: input });
                }
            )
        });
    });

    self.list = buildModuleIfExists(function ($module) {
        return createList({
            $: $module,
            fieldMap: getMapToHTML()
        });
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
                buildFormInputs({
                    $: $module,
                    factory: union(self, { fieldMap: getMapFromHTML() })
                }),
                function (input) {
                    return createFormGroup({ input: input });
                }
            )
        });
    }, 'search');

    return self;
};
