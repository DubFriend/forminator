var createFactory = function (fig) {
    var self = {},
        url = fig.url,
        $self = fig.$;


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

    self.form = function () {
        return createForm({
            $: $self,
            ajax: ajax,
            validate: fig.validate,
            onprogress: fig.onprogress,
            success: fig.success,
            error: fig.error,
            complete: fig.complete,
            url: url,
            inputs: map(
                buildFormInputs({ $: $self, factory: self }),
                function (input) {
                    return createFormGroup({ input: input });
                }
            )
        });
    };

    return self;
};
