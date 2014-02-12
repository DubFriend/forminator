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
        self.$mock.submit = function (callback) {
            self.submitCalled = true;
            self.callback = callback;
        };

        self.fileInputDisabled = null;
        self.fileFeedback = null;
        self.buttonInputDisabled = null;
        self.buttonFeedback = null;
        self.textInputDisabled = null;
        self.textFeedback = null;
        self.textGetData = 'textInputData';
        self.inputs = {
            fileInput: {
                getType: function () { return 'file'; },
                get: function () { return 'fileInputData'; },
                disable: function () { self.fileInputDisabled = true; },
                enable: function () { self.fileInputDisabled = false; },
                clearFeedback: function () { self.fileFeedback = false; },
                setFeedback: function (message) { self.fileFeedback = message; }
            },
            buttonInput: {
                getType: function () { return 'button'; },
                get: function () { return 'buttonInputData'; },
                disable: function () { self.buttonInputDisabled = true; },
                enable: function () { self.buttonInputDisabled = false; },
                clearFeedback: function () { self.buttonFeedback = false; },
                setFeedback: function (message) {
                    self.buttonFeedback = message;
                }
            },
            text: {
                $: self.$mock.find('input[name="text"]'),
                getType: function () { return 'text'; },
                get: function () { return self.textGetData; },
                disable: function () { self.textInputDisabled = true; },
                enable: function () { self.textInputDisabled = false; },
                clearFeedback: function () { self.textFeedback = false; },
                setFeedback: function (message) { self.textFeedback = message; }
            }
        };

        self.ajaxCalled = false;
        self.ajaxFig = null;

        self.createForm = function (override) {
            override = override || {};
            return createForm(union({
                $: self.$mock,
                inputs: self.inputs,
                ajax: function (fig) {
                    self.ajaxCalled = true;
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
    strictEqual(this.submitCalled, true, 'submit called on instantiation');
    strictEqual(this.preventDefaultCalled, false, 'preventDefault not called');
    strictEqual(this.ajaxCalled, false, 'ajax is not called');
});



test('trigger callback', function () {
    this.callback(this.$mockEvent);
    strictEqual(this.preventDefaultCalled, true, 'preventDefault is called');
    strictEqual(this.ajaxCalled, true, 'ajax is called');
    strictEqual(this.ajaxFig.url, 'testURL', 'ajax passed the url');
    strictEqual(this.ajaxFig.method, 'POST', 'ajax passed method (POST)');
    deepEqual(
        this.ajaxFig.data, { text: 'textInputData' },
        'ajax passed form data (excludes button and file inputs)'
    );
    strictEqual(this.ajaxFig.dataType, 'json', 'ajax passed dataType (json)');
    strictEqual(this.fileInputDisabled, null, 'fileInput not disabled');
    strictEqual(this.buttonInputDisabled, null, 'buttonInput not disabled');
    strictEqual(this.textInputDisabled, null, 'textInput not disabled');
    this.ajaxFig.beforeSend();
    strictEqual(this.fileInputDisabled, true, 'fileInput disabled');
    strictEqual(this.buttonInputDisabled, true, 'buttonInput disabled');
    strictEqual(this.textInputDisabled, true, 'textInput disabled');
    this.ajaxFig.complete();
    strictEqual(this.fileInputDisabled, false, 'fileInput enabled');
    strictEqual(this.buttonInputDisabled, false, 'buttonInput enabled');
    strictEqual(this.textInputDisabled, false, 'textInput enabled');
});

test('uses html form\'s action attribute if url is not given', function () {
    var form = this.createForm({ url: undefined });
    this.callback(this.$mockEvent);
    strictEqual(this.ajaxFig.url, 'respond.php', 'url is set');
});

test('error set', function () {
    this.textGetData = 'wrong';
    var form = this.createForm();
    this.callback(this.$mockEvent);
    strictEqual(this.fileFeedback, false, 'file feedback cleared');
    strictEqual(this.buttonFeedback, false, 'button feedback cleared');
    strictEqual(this.textFeedback, 'textErrorMessage', 'text feedback set');
    ok(this.$mock.hasClass('error'), 'form given error class');
    strictEqual(
        this.$mock.find('.frm-global-feedback').html(), 'globalErrorMessage',
        'global feedback message set'
    );
});

test('error cleared after success', function () {
    this.textGetData = 'wrong';
    var form = this.createForm();
    this.callback(this.$mockEvent);
    this.textGetData = 'ok';
    this.callback(this.$mockEvent);
    strictEqual(this.fileFeedback, false, 'file feedback cleared');
    strictEqual(this.buttonFeedback, false, 'button feedback cleared');
    strictEqual(this.textFeedback, false, 'text feedback cleared');
    ok(!this.$mock.hasClass('error'), 'form error class removed');
    strictEqual(
        this.$mock.find('.frm-global-feedback').html(), '',
        'global feedback message removed'
    );
});

test('ajaxFig publishes error on 409 response code', function () {
    expect(1);
    this.callback(this.$mockEvent);
    this.form.subscribe('error', function (data) {
        deepEqual(data, { text: 'ajax error message' });
    });
    this.ajaxFig.error({
        status: 409, responseJSON: { text: 'ajax error message' }
    });
});

test('setFeedback called on 409 ajax response', function () {
    this.callback(this.$mockEvent);
    this.ajaxFig.error({
        status: 409, responseJSON: { text: 'ajax error message' }
    });
    strictEqual(this.textFeedback, 'ajax error message', 'text feedback set');
});

test('ajaxFig does not publish error on non 409 response code', function () {
    expect(0);
    this.callback(this.$mockEvent);
    this.form.subscribe('error', function (data) { ok(false); });
    this.ajaxFig.error({ status: 408, responseJSON: 'testData' });
});
