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
        file: createInputFile
    };

    self.buildFormInputs = function () {
        return buildFormInputs({
            $: $self,
            factory: self
        });
    };

    self.form = function () {
        return createForm({
            $: $self,
            url: url,
            inputs: self.buildFormInputs()
        });
    };

    return self;
};
