module('createForm',{
    setup: function () {
        var self = this;

        self.preventDefaultCalled = false;
        self.$mockEvent = {
            preventDefault: function () {
                self.preventDefaultCalled = true;
            }
        };

        self.submitCalled = false;
        self.callback = null;
        self.$mock = {
            submit: function (callback) {
                self.submitCalled = true;
                self.callback = callback;
            }
        };

        self.fileInputDisabled = null;
        self.buttonInputDisabled = null;
        self.textInputDisabled = null;
        self.inputs = {
            fileInput: {
                getType: function () { return 'file'; },
                get: function () { return 'fileInputData'; },
                disable: function () { self.fileInputDisabled = true; },
                enable: function () { self.fileInputDisabled = false; }
            },
            buttonInput: {
                getType: function () { return 'button'; },
                get: function () { return 'buttonInputData'; },
                disable: function () { self.buttonInputDisabled = true; },
                enable: function () { self.buttonInputDisabled = false; }
            },
            textInput: {
                getType: function () { return 'text'; },
                get: function () { return 'textInputData'; },
                disable: function () { self.textInputDisabled = true; },
                enable: function () { self.textInputDisabled = false; }
            }
        };

        self.ajaxCalled = false;
        self.ajaxFig = null;
        self.form = createForm({
            $: self.$mock,
            inputs: self.inputs,
            ajax: function (fig) {
                self.ajaxCalled = true;
                self.ajaxFig = fig;
            },
            url: 'testURL'
        });
    }
});

test('submit callback is registered', function () {
    strictEqual(this.submitCalled, true, 'submit called on instantiation');
    strictEqual(this.preventDefaultCalled, false, 'preventDefault not called (yet)');
    strictEqual(this.ajaxCalled, false, 'ajax is not called (yet)');
});

test('trigger callback', function () {
    this.callback(this.$mockEvent);
    strictEqual(this.preventDefaultCalled, true, 'preventDefault is called');
    strictEqual(this.ajaxCalled, true, 'ajax is called');
    strictEqual(this.ajaxFig.url, 'testURL', 'ajax passed the url');
    strictEqual(this.ajaxFig.method, 'POST', 'ajax passed method (POST)');
    deepEqual(
        this.ajaxFig.data, { textInput: 'textInputData' },
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

test('ajaxFig publishes error on 409 response code', function () {
    expect(1);
    this.callback(this.$mockEvent);
    this.form.subscribe('error', function (data) {
        strictEqual(data, 'testData');
    });
    this.ajaxFig.error({
        status: 409,
        responseJSON: 'testData'
    });
});

test('ajaxFig does not publish error on non 409 response code', function () {
    expect(0);
    this.callback(this.$mockEvent);
    this.form.subscribe('error', function (data) {
        ok(true);
    });
    this.ajaxFig.error({
        status: 408,
        responseJSON: 'testData'
    });
});
