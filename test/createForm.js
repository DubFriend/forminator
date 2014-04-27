var $fixture = $('#qunit-fixture');
module('createForm',{
    setup: function () {
        var self = this;
        $fixture.html($('#forminator').html());
        self.preventDefaultCalled = false;
        self.$mockEvent = {
            preventDefault: function () {
                self.preventDefaultCalled = true;
            }
        };

        self.submitCalled = false;
        self.callback = null;
        self.$mock = $('.frm-name');
        self.fileInputDisabled = null;
        self.fileFeedback = null;
        self.fileClearCalled = false;
        self.buttonInputDisabled = null;
        self.buttonFeedback = null;
        self.buttonClearCalled = false;
        self.textInputDisabled = null;
        self.textFeedback = null;
        self.textClearCalled = false;
        self.textGetData = 'textInputData';
        self.hiddenInputDisabled = null;
        self.hiddenFeedback = null;
        self.hiddenClearCalled = false;

        self.inputs = {
            fileInput: mixinPubSub({
                getType: function () { return 'file'; },
                get: function () { return 'fileInputData'; },
                disable: function () { self.fileInputDisabled = true; },
                enable: function () { self.fileInputDisabled = false; },
                clearFeedback: function () { self.fileFeedback = false; },
                setFeedback: function (message) { self.fileFeedback = message; },
                clear: function () { self.fileClearCalled = true; }
            }),
            buttonInput: mixinPubSub({
                getType: function () { return 'button'; },
                get: function () { return 'buttonInputData'; },
                set: function (value) {
                    self.buttonInputSetParameters = value;
                },
                disable: function () { self.buttonInputDisabled = true; },
                enable: function () { self.buttonInputDisabled = false; },
                clearFeedback: function () { self.buttonFeedback = false; },
                setFeedback: function (message) {
                    self.buttonFeedback = message;
                },
                clear: function () { self.buttonClearCalled = true; }
            }),
            hiddenInput: mixinPubSub({
                getType: function () { return 'hidden'; },
                get: function () { return 'hiddenInputData'; },
                set: function (value) {
                    self.hiddenInputSetParameters = value;
                },
                disable: function () { self.hiddenInputDisabled = true; },
                enable: function () { self.hiddenInputDisabled = false; },
                clearFeedback: function () { self.hiddenFeedback = false; },
                setFeedback: function (message) {
                    self.hiddenFeedback = message;
                },
                clear: function () { self.hiddenClearCalled = true; }
            }),
            text: mixinPubSub({
                $: self.$mock.find('input[name="text"]'),
                getType: function () { return 'text'; },
                get: function () { return self.textGetData; },
                set: function (value) {
                    self.textInputSetParameters = value;
                },
                disable: function () { self.textInputDisabled = true; },
                enable: function () { self.textInputDisabled = false; },
                clearFeedback: function () { self.textFeedback = false; },
                setFeedback: function (message) { self.textFeedback = message; },
                setSuccess: function (value) {
                    this.setSuccessParameters = value;
                    this.setSuccessIsCalled = true;
                },
                clear: function () { self.textClearCalled = true; }
            })
        };

        self.ajaxCalled = false;
        self.ajaxFig = null;

        self.createForm = function (override) {
            override = override || {};
            return createForm(union({
                $: self.$mock,
                inputs: self.inputs,
                fieldValidators: {
                    text: function (data) {
                        if(data === 'wrong') {
                            return {
                                isSuccess: false,
                                message: 'test error message'
                            };
                        }
                        else if(data === 'right') {
                            return {
                                isSuccess: true,
                                message: 'test success message'
                            };
                        }
                    }
                },
                ajax: function ($form, figFN) {
                    self.ajaxCalled = true;
                    self.$form = $form;
                    self.ajaxFig = figFN();
                },
                validate: function (data) {
                    if(data.text === 'wrong') {
                        return {
                            text: 'textErrorMessage',
                            GLOBAL: 'globalErrorMessage'
                        };
                    }
                    else {
                        return {};
                    }
                },
                url: 'testURL'
            }, override));
        };
        self.form = self.createForm();
    }
});

test('field validate neutral', function () {
    this.inputs.text.publish('validate');
    ok(!this.inputs.text.setSuccessIsCalled, 'setSuccess not called');
    ok(!this.textFeedback, 'set feedback not called');
});

test('field validate success', function () {
    this.textGetData = 'right';
    this.inputs.text.publish('validate');
    strictEqual(this.inputs.text.setSuccessIsCalled, true);
});

test('field validate error', function () {
    this.textGetData = 'wrong';
    this.inputs.text.publish('validate');
    strictEqual(this.textFeedback, "test error message");
});

test('submit callback is registered', function () {
    strictEqual(this.ajaxCalled, true, 'ajax is called');
    deepEqual(this.$mock, this.$form, '$form is set');
    ok(this.ajaxFig, 'ajaxFig is set');
});

test('trigger validate success', function () {
    strictEqual(this.ajaxFig.validate(), true, 'validate trigger true');
});

test('trigger validate error', function () {
    this.textGetData = 'wrong';
    strictEqual(this.ajaxFig.validate(), false, 'validate trigger false');
    strictEqual(this.fileFeedback, false, 'file feedback cleared');
    strictEqual(this.buttonFeedback, false, 'button feedback cleared');
    strictEqual(this.textFeedback, 'textErrorMessage', 'text feedback set');
    ok(this.$mock.hasClass('error'), 'form given error class');
    strictEqual(
        this.$mock.find('.frm-global-feedback').html(), 'globalErrorMessage',
        'global feedback message set'
    );
});

test('trigger validate error publishes error', function () {
    expect(1);
    this.textGetData = 'wrong';
    this.form.subscribe('error', function (data) {
        deepEqual(data, {
            action: '',
            data: {
                text: 'textErrorMessage',
                GLOBAL: 'globalErrorMessage'
            }
        });
    });
    this.ajaxFig.validate();
});

test('trigger success', function () {
    this.ajaxFig.success({ successMessage: 'testSuccess' });
    strictEqual(this.fileFeedback, false, 'file feedback cleared');
    strictEqual(this.buttonFeedback, false, 'button feedback cleared');
    strictEqual(this.textFeedback, false, 'text feedback cleared');
    ok(this.$mock.hasClass('success'), 'form has success class');
    strictEqual(
        this.$mock.find('.frm-global-feedback').html(), 'testSuccess',
        'global feedback message set'
    );
});

test('trigger error', function () {
    this.ajaxFig.error({ text: 'errorMessage', GLOBAL: 'globalErrorMessage' });
    strictEqual(this.fileFeedback, false, 'file feedback cleared');
    strictEqual(this.buttonFeedback, false, 'button feedback cleared');
    strictEqual(this.textFeedback, 'errorMessage', 'text feedback set');
    ok(this.$mock.hasClass('error'), 'form given error class');
    strictEqual(
        this.$mock.find('.frm-global-feedback').html(), 'globalErrorMessage',
        'global feedback message set'
    );
});


test('error cleared after success', function () {
    this.ajaxFig.error({ text: 'errorMessage', GLOBAL: 'globalErrorMessage' });
    this.ajaxFig.success();
    strictEqual(this.fileFeedback, false, 'file feedback cleared');
    strictEqual(this.buttonFeedback, false, 'button feedback cleared');
    strictEqual(this.textFeedback, false, 'text feedback cleared');
    ok(!this.$mock.hasClass('error'), 'form error class removed');
    ok(this.$mock.hasClass('success'), 'form has success class');
    strictEqual(
        this.$mock.find('.frm-global-feedback').html(), '',
        'global feedback message removed'
    );
});

test('clearFeedback error', function () {
    this.ajaxFig.error({ text: 'errorMessage', GLOBAL: 'globalErrorMessage' });
    this.form.clearFeedback();
    strictEqual(this.textFeedback, false, 'text feedback cleared');
    strictEqual(
        this.$mock.find('.frm-global-feedback').html(), '',
        'globalFeedback message removed'
    );
    ok(!this.$mock.hasClass('error'), 'form error class removed');
});

test('clearFeedback success', function () {
    this.ajaxFig.success({ text: 'errorMessage', GLOBAL: 'globalSuccessMessage' });
    this.form.clearFeedback();
    strictEqual(this.textFeedback, false, 'text feedback cleared');
    strictEqual(
        this.$mock.find('.frm-global-feedback').html(), '',
        'globalFeedback message removed'
    );
    ok(!this.$mock.hasClass('success'), 'form error class removed');
});


test('trigger beforeSend', function () {
    this.ajaxFig.beforeSend();
    strictEqual(this.fileInputDisabled, null, 'fileInput not disabled');
    strictEqual(this.buttonInputDisabled, true, 'buttonInput disabled');
    strictEqual(this.textInputDisabled, true, 'textInput disabled');
});

test('trigger complete', function () {
    this.ajaxFig.complete();
    strictEqual(this.fileInputDisabled, false, 'fileInput enabled');
    strictEqual(this.buttonInputDisabled, false, 'buttonInput enabled');
    strictEqual(this.textInputDisabled, false, 'textInput enabled');
});

test('uses html form\'s action attribute if url is not given', function () {
    this.createForm({ url: undefined });
    strictEqual(this.ajaxFig.url, 'respond.php', 'url is set');
});

test('ajaxFig publishes error', function () {
    expect(1);
    this.form.subscribe('error', function (data) {
        deepEqual(data, { data: { errorData: 'foo' }, action: '' });
    });
    this.ajaxFig.error({ errorData: 'foo' });
});

test('setFeedback called on error ajax response', function () {
    this.ajaxFig.error({ text: 'ajax error message' });
    strictEqual(this.textFeedback, 'ajax error message', 'text feedback set');
});

test('set name and value parameters', function () {
    this.form.set('text', 'newValue');
    strictEqual(this.textInputSetParameters, 'newValue');
});

test('set object parameter', function () {
    this.form.set({
        text: 'foo', hiddenInput: 'bar'
    });
    strictEqual(this.textInputSetParameters, 'foo', 'text input is set');
    strictEqual(this.hiddenInputSetParameters, 'bar', 'hidden input is set');
});

test('get', function () {
    deepEqual(this.form.get(), {
        text: "textInputData",
        hiddenInput: "hiddenInputData"
    });
});

test('clear default', function () {
    this.form.clear();
    strictEqual(this.hiddenClearCalled, false, 'hidden not cleared');
    strictEqual(this.fileClearCalled, true, 'file is cleared');
    strictEqual(this.textClearCalled, true, 'text is cleared');
    strictEqual(this.buttonClearCalled, false, 'button not cleared');
});

test('clear hidden option', function () {
    this.form.clear({ isClearHidden: true });
    strictEqual(this.hiddenClearCalled, true, 'hidden cleared');
    strictEqual(this.fileClearCalled, true, 'file is cleared');
    strictEqual(this.textClearCalled, true, 'text is cleared');
    strictEqual(this.buttonClearCalled, false, 'button not cleared');
});

test('reset resets data to default values', function () {
    this.form.reset();
    strictEqual(
        this.textInputSetParameters, 'textInputData',
        'text input set to default value'
    );
    strictEqual(
        this.hiddenInputSetParameters, 'hiddenInputData',
        'hidden input set to default value'
    );
});

test('reset clears file inputs', function () {
    this.form.reset();
    ok(this.fileClearCalled);
});


