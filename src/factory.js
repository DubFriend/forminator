var createFactory = function (fig) {
    var self = {},
        url = fig.url,
        name = fig.name,
        fieldMap = fig.fieldMap || {},
        uniquelyIdentifyingFields = fig.uniquelyIdentifyingFields,
        deleteConfirmation = fig.deleteConfirmation,
        $getModuleByClass = partial($getForminatorByClass, name);

    var buildModuleIfExists = function (fn, $module) {
        return function () {
            var args = argumentsToArray(arguments);
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

    var getMappedFormInputs = function ($form) {
        return map(
            buildFormInputs({
                $: $form,
                factory: self
            }),
            function (input) {
                return createFormGroup({ input: input });
            }
        );
    };

    self.form = buildModuleIfExists(function ($module) {
        return createForm({
            $: $module,
            ajax: ajax,
            validate: fig.validate,
            // onprogress: fig.onprogress,
            // success: fig.success,
            // error: fig.error,
            // complete: fig.complete,
            url: url,
            inputs: getMappedFormInputs($module)
        });
    }, $getModuleByClass(''));

    self.list = buildModuleIfExists(function ($module, request) {
        return createList({
            $: $module,
            fieldMap: fieldMap,
            request: request,
            uniquelyIdentifyingFields: uniquelyIdentifyingFields,
            deleteConfirmation: deleteConfirmation
        });
    }, $getModuleByClass('list'));

    self.newItemButton = buildModuleIfExists(function ($module) {
        return createNewItemButton({ $: $module });
    }, $getModuleByClass('new'));

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
            inputs: getMappedFormInputs($module)
        });
    }, $getModuleByClass('search'));

    self.ordinator = buildModuleIfExists(function ($module, request) {
        return createOrdinator({
            $: $module,
            request: request,
            orderIcons: fig.orderIcons
        });
    }, $getModuleByClass('ordinator'));

    self.paginator = function (request) {
        return createPaginator({
            name: name,
            request: request,
            gotoPage: self.gotoPage()
        });
    };

    self.gotoPage = buildModuleIfExists(function ($module) {
        return createGotoPage({
            $: $module,
            inputs: getMappedFormInputs($module)
        });
    }, $getModuleByClass('goto-page'));

    return self;
};
