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
        self.$mock = $('#frm-name');
        // self.$mock.submit = function (callback) {

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
            fileInput: {
                getType: function () { return 'file'; },
                get: function () { return 'fileInputData'; },
                disable: function () { self.fileInputDisabled = true; },
                enable: function () { self.fileInputDisabled = false; },
                clearFeedback: function () { self.fileFeedback = false; },
                setFeedback: function (message) { self.fileFeedback = message; },
                clear: function () { self.fileClearCalled = true; }
            },
            buttonInput: {
                getType: function () { return 'button'; },
                get: function () { return 'buttonInputData'; },
                disable: function () { self.buttonInputDisabled = true; },
                enable: function () { self.buttonInputDisabled = false; },
                clearFeedback: function () { self.buttonFeedback = false; },
                setFeedback: function (message) {
                    self.buttonFeedback = message;
                },
                clear: function () { self.buttonClearCalled = true; }
            },
            hiddenInput: {
                getType: function () { return 'hidden'; },
                get: function () { return 'hiddenInputData'; },
                disable: function () { self.hiddenInputDisabled = true; },
                enable: function () { self.hiddenInputDisabled = false; },
                clearFeedback: function () { self.hiddenFeedback = false; },
                setFeedback: function (message) {
                    self.hiddenFeedback = message;
                },
                clear: function () { self.hiddenClearCalled = true; }
            },
            text: {
                $: self.$mock.find('input[name="text"]'),
                getType: function () { return 'text'; },
                get: function () { return self.textGetData; },
                disable: function () { self.textInputDisabled = true; },
                enable: function () { self.textInputDisabled = false; },
                clearFeedback: function () { self.textFeedback = false; },
                setFeedback: function (message) { self.textFeedback = message; },
                clear: function () { self.textClearCalled = true; }
            }
        };

        self.ajaxCalled = false;
        self.ajaxFig = null;

        self.createForm = function (override) {
            override = override || {};
            return createForm(union({
                $: self.$mock,
                inputs: self.inputs,
                ajax: function ($form, fig) {
                    self.ajaxCalled = true;
                    self.$form = $form;
                    self.ajaxFig = fig;
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
            text: 'textErrorMessage',
            GLOBAL: 'globalErrorMessage'
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

test('trigger beforeSend', function () {
    this.ajaxFig.beforeSend();
    strictEqual(this.fileInputDisabled, true, 'fileInput disabled');
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
        deepEqual(data, { errorData: 'foo' });
    });
    this.ajaxFig.error({ errorData: 'foo' });
});

test('setFeedback called on error ajax response', function () {
    this.ajaxFig.error({ text: 'ajax error message' });
    strictEqual(this.textFeedback, 'ajax error message', 'text feedback set');
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