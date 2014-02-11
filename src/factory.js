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
        button: createInputButton
    };

    self.form = function () {
        return createForm({
            $: $self,
            ajax: ajax,
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
