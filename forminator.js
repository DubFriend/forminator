// forminator version 0.0.0
// https://github.com/DubFriend/forminator
// (MIT) 02-03-2014
// Brian Detering <BDeterin@gmail.com> (http://www.briandetering.net/)
(function () {
'use strict';

(function ($) {
    'use strict';

    var isArray = function (value) {
        return $.isArray(value);
    };

    var isObject = function (value) {
        return !isArray(value) && (value instanceof Object);
    };

    var isFunction = function (value) {
        return value instanceof Function;
    };

    var foreach = function (collection, callback) {
        for(var i in collection) {
            if(collection.hasOwnProperty(i)) {
                callback(collection[i], i, collection);
            }
        }
    };

    var partial = function (f) {
        var args = Array.prototype.slice.call(arguments, 1);
        return function () {
            var remainingArgs = Array.prototype.slice.call(arguments);
            return f.apply(null, args.concat(remainingArgs));
        };
    };

    var union = function () {
        var united = {}, i;
        for(i = 0; i < arguments.length; i += 1) {
            foreach(arguments[i], function (value, key) {
                united[key] = value;
            });
        }
        return united;
    };

    var filter = function (collection, callback) {
        var filtered;

        if(isArray(collection)) {
            filtered = [];
            foreach(collection, function (val, key, coll) {
                if(callback(val, key, coll)) {
                    filtered.push(val);
                }
            });
        }
        else {
            filtered = {};
            foreach(collection, function (val, key, coll) {
                if(callback(val, key, coll)) {
                    filtered[key] = val;
                }
            });
        }

        return filtered;
    };

    var indexOf = function (object, value) {
        return $.inArray(value, object);
    };

    var excludedSet = function (object, excludedKeys) {
        return filter(object, function (value, key) {
            return indexOf(excludedKeys, key) === -1;
        });
    };

    var bind = function (self, f) {
        return function boundFunction () {
            (f || function () {}).apply(self, arguments);
        };
    };

    var doesEndWithBrackets = function (string) {
        return (/\[\]$/).test(string);
    };

    var insertIndexIntoBrackets = function (string, index) {
        return string.substring(0, string.length - 1) + index + ']';
    };

    // unnamed inputs are ignored.
    var groupInputsByNameAttribute = function ($elems) {
        var grouped = {};
        $elems.each(function () {
            var name = $(this).attr('name');
            if(name) {
                if(!grouped[name]) {
                    grouped[name] = [];
                }
                grouped[name].push($(this));
            }
        });
        return grouped;
    };

    // $form gets set by $.fn.fileAjax
    var $form;

    var getNonFileInputs = function () {
        return $form.find(
            'input[type="checkbox"], ' +
            'input[type="radio"], ' +
            'input[type="text"], ' +
            'input[type="hidden"], ' +
            'textarea, ' +
            'select'
        );
    };

    var getData = function (figGetData) {
        var flattenData = function (data) {
            var formatted = {};
            foreach(data, function (value, name) {
                (function recurse (name, value) {
                    if(isObject(value) || isArray(value)) {
                        foreach(value, function (val, key) {
                            recurse(name + '[' + key + ']', val);
                        });
                    }
                    else {
                        formatted[name] = value;
                    }
                }(name, value));
            });
            return formatted;
        };

        var getFormsData = function () {
            var grouped = groupInputsByNameAttribute(getNonFileInputs());

            var data = {};

            var addData = function ($input, name) {
                var isCheckBoxOrRadio = function () {
                    return $input.is('input[type="checkbox"]') ||
                           $input.is('input[type="radio"]');
                };

                var getInputsValue = function () {
                    if($input.is('textarea')) {
                        return $input.html();
                    }
                    else if(isCheckBoxOrRadio()) {
                        if($input.is(':checked')) {
                            return $input.val();
                        }
                    }
                    else {
                        return $input.val();
                    }
                };

                var value = getInputsValue();
                if(isCheckBoxOrRadio() && value || !isCheckBoxOrRadio()) {
                    data[name] = value;
                }
            };

            foreach(grouped, function (inputGroup, name) {
                if(doesEndWithBrackets(name)) {
                    foreach(inputGroup, function ($input, index) {
                        addData($input, insertIndexIntoBrackets(name, index));
                    });
                }
                else if(inputGroup.length > 1) {
                    foreach(inputGroup, function ($input) {
                        addData($input, name);
                    });
                }
                else {
                    addData(inputGroup[0], name);
                }
            });

            return data;
        };

        return figGetData ? flattenData(figGetData()) : getFormsData();
    };

    var extractMetaDataFromResonse = function (text) {
        if(text) {
            var data = text.match(/#@#.*#@#/igm);
            if(data && data[0]) {
                data = data[0].substring(3, data[0].length - 3);
                data = $.parseJSON(data);
                return data;
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    };

    var extractBodyFromResponse = function (text) {
        if(text) {
            return text.replace(/#@#.*#@#/igm, '');
        }
        else {
            return null;
        }
    };

    var setInput = function (value, $input) {
        if(
            $input.is('input[type="text"]') ||
            $input.is('select') ||
            $input.is('input[type="hidden"]') ||
            $input.is('textarea')
        ) {
            $input.val(value);
        }
        else if(
            $input.is('input[type="checkbox"]') ||
            $input.is('input[type="radio"]')
        ) {
            if(value === '' || value === null) {
                $input.prop('checked', false);
            }
            else {
                $input.filter('[value="' + value + '"]').prop('checked', true);
            }
        }
    };

    var clearFileInputs = function ($frm) {
        $frm = $frm || $form;
        // http://stackoverflow.com/questions/1043957/clearing-input-type-file-using-jquery
        $frm.find('input[type="file"]').each(function () {
            $(this).wrap('<form>').closest('form').get(0).reset();
            $(this).unwrap();
        });
    };

    var clearForm = function (isClearHidden) {
        isClearHidden = isClearHidden || false;
        getNonFileInputs().not('input[type="hidden"]').each(function() {
            setInput('', $(this));
        });
        if(isClearHidden) {
            $form.find('input[type="hidden"]').each(function () {
                setInput('', $(this));
            });
        }
        clearFileInputs();
    };

    // call user function applied with supplied utility functions.
    var applyUserFunction = function (fn) {
        if(isFunction(fn)) {
            return fn.apply({
                clear: clearForm,
                clearFileInputs: clearFileInputs,
                set: function (name, value) {
                    setInput(value, $form.find('[name="' + name + '"]'));
                },
                get: getData
            }, Array.prototype.slice.call(arguments, 1));
        }
    };

    var applyUserResponse = function (parsedResponse, success, error) {
        var response = parsedResponse.response;
        var metaData = parsedResponse.metaData;
        var status = metaData && metaData.status || response.status;
        if(!status || status >= 200 && status < 300) {
            applyUserFunction(success, response, metaData);
        }
        else {
            applyUserFunction(error, response, metaData);
        }
    };

    var extractResponse = function (response, dataType) {
        var metaData = extractMetaDataFromResonse(response);
        response = extractBodyFromResponse(response);
        if(dataType.toLowerCase() === 'json') {
            response = $.parseJSON(response);
        }

        return {
            metaData: metaData,
            response: response
        };
    };

    var ajax2 = function (fig) {
        // get object of $fileElements where the keys are
        // names formatted for a FormData object.
        var getFileElements = function () {
            // inserts indexed numbers into braketed items.
            // ex: "file[]", "file[]" -> "file[0]", "file[1]"
            var formatName = function (rawName, index) {
                // test if ends in brackets
                return doesEndWithBrackets(rawName) ?
                    insertIndexIntoBrackets(rawName, index) : rawName;
            };

            var grouped = groupInputsByNameAttribute(
                $form.find('input[type="file"]')
            );

            console.log(grouped);

            var elements = {};
            foreach(grouped, function (elems, name) {
                foreach(elems, function ($el, index) {
                    elements[formatName(name, index)] = $el;
                });
            });
            return elements;
        };


        $form.submit(function (e) {
            console.log('ajax2');
            e.preventDefault();

            if(!fig.validate || fig.validate()) {

                var formData = new FormData();

                foreach(getData(), function (value, key) {
                    formData.append(key, value);
                });

                foreach(getFileElements(), function ($file, name) {
                    var file = $file[0];
                    if(file.files.length > 0) {
                        if(file.files.length === 0) {
                            formData.append(name, file.files[0]);
                        }
                        else {
                            foreach(file.files, function (file, index) {
                                console.log(file);
                                formData.append(name + '[' + index + ']', file);
                            });
                        }
                    }
                });

                $.ajax(excludedSet(union(fig, {
                    processData : false,
                    contentType: false,
                    data: null,
                    type: 'POST',
                    dataType: 'text',
                    beforeSend : function(xhr, settings) {
                        settings.xhr = function () {
                            var xhr = new window.XMLHttpRequest();
                            xhr.upload.onprogress = bind(this, fig.onprogress);
                            xhr.upload.onload = bind(this, fig.onload);
                            xhr.upload.onerror = bind(this, fig.onerror);
                            xhr.upload.onabort = bind(this, fig.onabort);
                            return xhr;
                        };
                        settings.data = formData;
                        applyUserFunction(fig.beforeSend);
                    },
                    success: function (response, textStatus, jqXHR) {
                        var parsedResponse = extractResponse(
                            response, fig.dataType
                        );
                        applyUserResponse(
                            parsedResponse, fig.success, fig.error
                        );
                    },
                    error: function (jqXHR) {
                        var parsedResponse = extractResponse(
                            jqXHR.responseText, fig.dataType
                        );
                        applyUserFunction(
                            fig.error,
                            parsedResponse.response,
                            parsedResponse.metaData
                        );
                    },
                    complete: function (jqXHR) {
                        var parsedResponse = extractResponse(
                            jqXHR.responseText, fig.dataType
                        );
                        applyUserFunction(
                            fig.complete,
                            parsedResponse.response,
                            parsedResponse.metaData
                        );
                    }
                })), ['$files', 'getData']);

            }
        });
    };

    var iframeAjax = function (fig) {
        $form.submit(function (e) {
            console.log('iframeAjax');
            e.stopPropagation();

            if(!fig.validate || fig.validate()) {

                var iframeID = 'file-ajax-id-' + (new Date()).getTime();

                $('body').prepend(
                    '<iframe width="0" height="0" style="display:none;" ' +
                    'name="' + iframeID + '" id="' + iframeID + '"/>'
                );

                var nonFileElements = {};
                getNonFileInputs().each(function () {
                    var name = $(this).attr('name');
                    if(name) {
                        nonFileElements[name] = $(this);
                    }
                });

                var removeNonFileInputsNames = function () {
                    foreach(nonFileElements, function ($el) {
                        $el.removeAttr('name');
                    });
                };

                var restoreNonFileInputsNames = function () {
                    foreach(nonFileElements, function ($el, name) {
                        $el.attr('name', name);
                    });
                };

                var $iframe = $('#' + iframeID);

                $iframe.on('load', function(e) {
                    var responseText = $iframe.contents().find('body').html();
                    var parsedResponse = extractResponse(
                        responseText, fig.dataType
                    );

                    applyUserResponse(parsedResponse, fig.success, fig.error);

                    restoreNonFileInputsNames();
                    removeHiddenInputs();
                    $iframe.remove();

                    applyUserFunction(
                        fig.complete,
                        parsedResponse.response,
                        parsedResponse.metaData
                    );
                });

                // need getData before removeNonFileInputsNames
                var data = getData();
                // remove names of existing inputs so they are not sent to the
                // server and send the data given by getData instead.
                removeNonFileInputsNames();
                var hiddenInputs = [];
                foreach(data, function (value, name) {
                    var $hidden = $(
                        '<input type="hidden" ' +
                               'name="' + name + '" ' +
                               'value="' + value + '"/>'
                    );
                    $form.append($hidden);
                    hiddenInputs.push($hidden);
                });

                var removeHiddenInputs = function () {
                    foreach(hiddenInputs, function ($el) {
                        $el.remove();
                    });
                };

                $form.attr({
                    target: iframeID,
                    action: fig.url,
                    method: 'POST',
                    enctype: 'multipart/form-data'
                });
            }
            else {
                e.preventDefault();
            }
        });
    };

    var fileAjax = function (fig) {
        $form = $(this);

        if(!$form.is('form')) {
            throw 'selected element must be a form element';
        }

        fig.url = fig.url || $form.attr('action');

        getData = partial(getData, fig.getData);

        if(
            $.support.ajax &&
            typeof FormData !== "undefined" &&
            fig.forceIFrame !== true
        ) {
            ajax2(fig);
        }
        else {
            iframeAjax(fig);
        }
    };

    fileAjax.clearFileInputs = clearFileInputs;
    $.fn.fileAjax = fileAjax;
    $.fileAjax = fileAjax;

}(jQuery));

var identity = function (x) {
    return x;
};

var isArray = function (value) {
    return $.isArray(value);
};

var isObject = function (value) {
    return !isArray(value) && (value instanceof Object);
};

var isFunction = function (value) {
    return value instanceof Function;
};

var partial = function (f) {
    var args = Array.prototype.slice.call(arguments, 1);
    if(isFunction(f)) {
        return function () {
            var remainingArgs = Array.prototype.slice.call(arguments);
            return f.apply(null, args.concat(remainingArgs));
        };
    }
};

var argumentsToArray = function (args) {
    var array = [], i;
    for(i = 0; i < args.length; i += 1) {
        array.push(args[i]);
    }
    return array;
};

var isEmpty = function (object) {
    for(var i in object) {
        if(object.hasOwnProperty(i)) {
            return false;
        }
    }
    return true;
};

var isNumeric = function (candidate) {
    return !isNaN(candidate);
};

var isInteger = function (candidate) {
    return isNumeric(candidate) && Number(candidate) % 1 === 0;
};

var indexOf = function (object, value) {
    return $.inArray(value, object);
};

var inArray = function (array, value) {
    return indexOf(array, value) !== -1;
};

//deep copy of json objects
var copy = function (object) {
    return $.extend(true, {}, object);
};

var shallowCopy = function (objects) {
    return map(objects, identity);
};

var foreach = function (collection, callback) {
    for(var i in collection) {
        if(collection.hasOwnProperty(i)) {
            callback(collection[i], i, collection);
        }
    }
};

var range = function (a, b) {
    var i, start, end, array = [];
    if(b === undefined) {
        start = 0;
        end = a - 1;
    }
    else {
        start = a;
        end = b;
    }
    for(i = start; i <= end; i += 1) {
        array.push(i);
    }
    return array;
};

var reverse = function (array) {
    var reversed = [], i;
    for(i = array.length - 1; i >= 0; i -= 1) {
        reversed.push(array[i]);
    }
    return reversed;
};

var last = function (array) {
    return array[array.length - 1];
};

var mapToArray = function (collection, callback) {
    var mapped = [];
    foreach(collection, function (value, key, coll) {
        mapped.push(callback(value, key, coll));
    });
    return mapped;
};

var mapToObject = function (collection, callback, keyCallback) {
    var mapped = {};
    foreach(collection, function (value, key, coll) {
        key = keyCallback ? keyCallback(key, value) : key;
        mapped[key] = callback(value, key, coll);
    });
    return mapped;
};

var appendKey = function (appendingString, collection) {
    return map(collection, identity, function (key) {
        return appendingString + key;
    });
};

var map = function (collection, callback, keyCallback) {
    return isArray(collection) ?
        mapToArray(collection, callback) :
        mapToObject(collection, callback, keyCallback);
};

var pluck = function(collection, key) {
    return map(collection, function (value) {
        return value[key];
    });
};

var call = function (collection, functionName, args, self) {
    return map(collection, function (object, name) {
        // console.log(functionName, name, object);
        return object[functionName].apply(object, args || []);
    });
};

var keys = function (collection) {
    return mapToArray(collection, function (val, key) {
        return key;
    });
};

var values = function (collection) {
    return mapToArray(collection, function (val) {
        return val;
    });
};

var reduce = function (collection, callback, initialAccumulation) {
    var accumulation = initialAccumulation;
    foreach(collection, function (val, key) {
        accumulation = callback(accumulation, val, key, collection);
    });
    return accumulation;
};

var filter = function (collection, callback) {
    var filtered;

    if(isArray(collection)) {
        filtered = [];
        foreach(collection, function (val, key, coll) {
            if(callback(val, key, coll)) {
                filtered.push(val);
            }
        });
    }
    else {
        filtered = {};
        foreach(collection, function (val, key, coll) {
            if(callback(val, key, coll)) {
                filtered[key] = val;
            }
        });
    }

    return filtered;
};

var union = function () {
    var united = {}, i;
    for(i = 0; i < arguments.length; i += 1) {
        foreach(arguments[i], function (value, key) {
            united[key] = value;
        });
    }
    return united;
};

var subSet = function (object, subsetKeys) {
    return filter(object, function (value, key) {
        return indexOf(subsetKeys, key) !== -1;
    });
};

var excludedSet = function (object, excludedKeys) {
    return filter(object, function (value, key) {
        return indexOf(excludedKeys, key) === -1;
    });
};

var remove = function (collection, item) {
    return filter(collection, function (element) {
        return element !== item;
    });
};

// call the variable if it is a function.
var callIfFunction = function (fn) {
    if(isFunction(fn)) {
        return fn();
    }
};

//execute callback immediately and at most one time on the minimumInterval,
//ignore block attempts
var throttle = function (minimumInterval, callback) {
    var timeout = null;
    return function () {
        var that = this, args = arguments;
        if(timeout === null) {
            timeout = setTimeout(function () {
                timeout = null;
            }, minimumInterval);
            callback.apply(that, args);
        }
    };
};

//execute callback at most one time on the minimumInterval
var debounce = function (minimumInterval, callback, isImmediate) {
    var timeout = null;
    var isAttemptBlockedOnInterval = false;
    return function () {
        var that = this, args = arguments;
        if(timeout === null) {
            timeout = setTimeout(function () {
                if(!isImmediate || isAttemptBlockedOnInterval) {
                    callback.apply(that, args);
                }
                isAttemptBlockedOnInterval = false;
                timeout = null;
            }, minimumInterval);
            if(isImmediate) {
                callback.apply(that, args);
            }
        }
        else {
            isAttemptBlockedOnInterval = true;
        }
    };
};

var generateUniqueID = (function () {
    var count = 0;
    return function () {
        return count += 1;
    };
}());

var mixinPubSub = function (object) {
    object = object || {};
    var topics = {};

    object.publish = function (topic, data) {
        foreach(topics[topic], function (callback) {
            callback(data);
        });
    };

    object.subscribe = function (topic, callback) {
        topics[topic] = topics[topic] || [];
        topics[topic].push(callback);
    };

    object.unsubscribe = function (callback) {
        foreach(topics, function (subscribers) {
            var index = indexOf(subscribers, callback);
            if(index !== -1) {
                subscribers.splice(index, 1);
            }
        });
    };

    return object;
};


// queryjs
// https://github.com/DubFriend/queryjs
// MIT License 2014 Brian Detering
var queryjs = (function () {
    'use strict';

    var queryjs = {};

    var parse = function (url) {
        var domain = '', hash = '';
        var getParameterStrings = function () {
            var isHash = indexOf(url, '#') !== -1,
                isQuery = indexOf(url, '?') !== -1,
                queryString = '';

            if(isQuery) {
                queryString = url.split('?')[1] || '';
                if(isHash) {
                    queryString = queryString.split('#')[0] || '';
                }
            }

            if(isQuery) {
                domain = url.split('?')[0] || '';
            }
            else if (isHash) {
                domain = url.split('#')[0] || '';
            }
            else {
                domain = url;
            }

            if(isHash) {
                hash = url.split('#')[1] || '';
            }

            return queryString ? queryString.split('&') : [];
        };

        var parameterStrings = getParameterStrings(url),
            params = {},
            key, value, i;

        for(i = 0; i < parameterStrings.length; i += 1) {
            key = parameterStrings[i].split('=')[0];
            value = parameterStrings[i].split('=')[1];
            params[key] = value;
        }

        return {
            url: domain || '',
            hash: hash || '',
            parameters: params
        };
    };

    var stringify = function (parsed) {
        var key, parameterStrings = [];

        foreach(parsed.parameters, function (value, key) {
            parameterStrings.push(key + '=' + parsed.parameters[key]);
        });

        return parsed.url +
            (parameterStrings.length > 0 ?
                '?' + parameterStrings.join('&') : '') +
            (parsed.hash ? '#' + parsed.hash : '');
    };

    queryjs.get = function (url) {
        return parse(url).parameters;
    };

    queryjs.set = function (url, params) {
        var parsed = parse(url);
        parsed.parameters = union(parsed.parameters, params);
        return stringify(parsed);
    };

    return queryjs;

}());


if (typeof console === "undefined"){
    console={};
    console.warn = function () {};
}

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

var ajax = function ($form, fig) {
    if($form.find('input[type="file"]').length) {
        // form contains files. fileAjax enables cross browser ajax file uploads
        var getData = function () {
            return map(fig.getData() || {}, identity, function (key) {
                return key.replace(/\[\]$/, '');
            });
        };
        $form.fileAjax(fig);
    }
    else {
        // form has no files, use standard ajax.
        $form.submit(function (e) {
            console.log('asdf', callIfFunction(fig.getData));
            e.preventDefault();
            if(fig.validate()) {
                $.ajax({
                    url: fig.url,
                    method: 'POST',
                    data: callIfFunction(fig.getData),
                    dataType: fig.dataType,
                    beforeSend: fig.beforeSend,
                    success: function (response) {
                        if(
                            isObject(response) &&
                            (response.status < 200 || response.status >= 300)
                        ) {
                            if(fig.error) {
                                fig.error(response);
                            }
                        }
                        else {
                            fig.success(response);
                        }
                    },
                    error: function (jqXHR) {
                        console.log(jqXHR);
                        if(fig.error) {
                            var dataType = fig.dataType ?
                                fig.dataType.toLowerCase() : null;
                            fig.error(
                                jqXHR.responseJSON
                            );
                        }
                    },
                    complete: fig.complete
                });
            }
        });
    }
};
var createBaseInput = function (fig, my) {
    var self = mixinPubSub(),
        $self = fig.$;

    self.getType = function () {
        throw 'implement me (return type. "text", "radio", etc.)';
    };

    self.$ = function (selector) {
        return selector ? $self.find(selector) : $self;
    };

    self.disable = function () {
        self.$().prop('disabled', true);
        self.publish('isEnabled', false);
    };

    self.enable = function () {
        self.$().prop('disabled', false);
        self.publish('isEnabled', true);
    };

    return self;
};


var createInput = function (fig, my) {
    var self = createBaseInput(fig, my);

    self.get = function () {
        return self.$().val();
    };

    self.set = function (newValue) {
        var oldValue = self.get();
        if(oldValue !== newValue) {
            self.$().val(newValue);
            self.publish('change', newValue);
        }
    };

    self.clear = function () {
        self.set('');
    };

    my.buildSetter = function (callback) {
        return function (newValue) {
            var oldValue = self.get();
            if(oldValue !== newValue) {
                callback.call(self, newValue);
                self.publish('change', newValue);
            }
        };
    };

    return self;
};

var createInputButton = function (fig) {
    var my = {},
        self = createInput(fig, my);

    self.getType = function () {
        return 'button';
    };

    return self;
};

var createInputCheckbox = function (fig) {
    var my = {},
        self = createInput(fig, my);

    self.getType = function () {
        return 'checkbox';
    };

    self.get = function () {
        var values = [];
        self.$().filter(':checked').each(function () {
            if($(this).is(':checked')) {
                values.push($(this).val());
            }
        });
        return values;
    };

    self.set = function (newValues) {
        newValues = newValues || [];
        if(!isArray(newValues)) {
            newValues = [newValues];
        }

        var oldValues = self.get(),
            isDifferent = false;

        if(oldValues.length === newValues.length) {
            foreach(oldValues, function (value) {
                if(indexOf(newValues, value) === -1) {
                    isDifferent = true;
                }
            });
        }
        else {
            isDifferent = true;
        }

        if(isDifferent) {
            self.$().each(function () {
                $(this).prop('checked', false);
            });
            foreach(newValues, function (value) {
                self.$().filter('[value="' + value + '"]')
                    .prop('checked', true);
            });
            self.publish('change', newValues);
        }
    };

    self.$().click(function () {
        self.publish('change', self.get());
    });

    return self;
};

var createInputFile = function (fig) {
    var my = {},
        self = createBaseInput(fig, my);

    self.getType = function () {
        return 'file';
    };

    self.get = function () {
        return last(self.$().val().split('\\'));
    };

    self.clear = function () {
        $.fileAjax.clearFileInputs(self.$().parent());
    };

    self.$().change(function () {
        self.publish('change', self.get());
    });

    return self;
};

var createInputRadio = function (fig) {
    var my = {},
        self = createInput(fig, my);

    self.getType = function () {
        return 'radio';
    };

    self.get = function () {
        return self.$().filter(':checked').val() || null;
    };

    self.set = my.buildSetter(function (newValue) {
        self.$().filter('[value="' + newValue + '"]').prop('checked', true);
    });

    self.$().change(function () {
        self.publish('change', self.get());
    });

    return self;
};

var createInputSelect = function (fig) {
    var my = {},
        self = createInput(fig, my);

    self.getType = function () {
        return 'select';
    };

    self.$().change(function () {
        self.publish('change', self.get());
    });

    return self;
};

var createInputText = function (fig) {
    var my = {},
        self = createInput(fig, my);

    self.getType = function () {
        return 'text';
    };

    self.$().keyup(function (e) {
        self.publish('change', self.get());
    });

    return self;
};

var createInputTextarea = function (fig) {
    var my = {},
        self = createInput(fig, my);

    self.getType = function () {
        return 'textarea';
    };

    self.$().keyup(function () {
        self.publish('change', self.get());
    });

    return self;
};

var createInputHidden = function (fig) {
    var my = {},
        self = createInput(fig, my);

    self.getType = function () {
        return 'hidden';
    };

    self.$().keyup(function (e) {
        self.publish('change', self.get());
    });

    return self;
};
var buildFormInputs = function (fig) {
    var $self = fig.$,
        factory = fig.factory,
        inputs = {};

    var addInputsBasic = function (type, selector, group) {
        group = group || inputs;
        $self.find(selector).each(function () {
            group[$(this).attr('name')] = factory.input[type]({ $: $(this) });
        });
    };

    addInputsBasic('text', 'input[type="text"]');
    addInputsBasic('textarea', 'textarea');
    addInputsBasic('select', 'select');
    addInputsBasic('file', 'input[type="file"]');
    addInputsBasic('button', 'input[type="button"], input[type="submit"]');
    addInputsBasic('hidden', 'input[type="hidden"]');

    var addInputsGroup = function (type, selector) {
        var names = [];
            $self.find(selector).each(function () {
            if(indexOf(names, $(this).attr('name')) === -1) {
                names.push($(this).attr('name'));
            }
        });
        foreach(names, function (name) {
            inputs[name] = factory.input[type]({
                $: $self.find('input[name="' + name + '"]')
            });
        });
    };

    addInputsGroup('radio', 'input[type="radio"]');
    addInputsGroup('checkbox', 'input[type="checkbox"]');

    return inputs;
};

var createFormGroup = function (fig) {
    var self = {},
        input = fig.input,
        $self = input.$().closest('.frm-group');

    self.get = input.get || function () {};
    self.set = input.set || function () {};
    self.clear = input.clear || function () {};
    self.disable = input.disable;
    self.enable = input.enable;
    self.getType = input.getType;

    self.$ = function (selector) {
        return selector ? $self.find(selector) : $self;
    };

    // minimizing dom manipulation.
    (function () {
        var oldMessage = null,
            isError = false;

        self.setFeedback = function (newMessage) {
            if(!isError) {
                self.$().addClass('error');
            }
            if(newMessage !== oldMessage) {
                self.$('.frm-feedback').html(newMessage);
            }
            oldMessage = newMessage;
            isError = true;
        };

        self.clearFeedback = function () {
            if(isError) {
                self.$().removeClass('error');
                self.$('.frm-feedback').html('');
            }
            oldMessage = null;
            isError = false;
        };
    }());

    return self;
};

var createForm = function (fig) {
    var self = mixinPubSub(),
        $self = fig.$,
        $feedback = $self.find('.frm-global-feedback'),
        ajax = fig.ajax,
        url = fig.url || $self.attr('action'),
        inputs = fig.inputs;

    //minimize dom manipulation
    (function () {
        var isError = false,
            oldMessage = null;

        self.setGlobalFeedback = function (newMessage) {
            self.clearGlobalSuccess();
            if(!isError) {
                $self.addClass('error');
            }
            if(newMessage !== oldMessage) {
                $feedback.html(newMessage);
            }
            isError = true;
            oldMessage = newMessage;
        };

        self.clearGlobalFeedback = function () {
            if(isError) {
                $self.removeClass('error');
            }
            if(oldMessage) {
                $feedback.html('');
            }
            isError = false;
            oldMessage = null;
        };
    }());

    (function () {
        var isSuccess = false,
            oldMessage = null;

        self.setGlobalSuccess = function (newMessage) {
            self.clearFeedback();
            if(!isSuccess) {
                $self.addClass('success');
            }
            if(newMessage !== oldMessage) {
                $feedback.html(newMessage);
            }
            isSuccess = true;
            oldMessage = newMessage;
        };

        self.clearGlobalSuccess = function () {
            if(isSuccess) {
                $self.removeClass('success');
            }
            if(oldMessage) {
                $feedback.html('');
            }
            isSuccess = false;
            oldMessage = null;
        };
    }());

    self.setFeedback = function (feedback) {
        feedback = feedback || {};
        self.clearFeedback();
        foreach(subSet(inputs, keys(feedback)), function (input, name) {
            input.setFeedback(feedback[name]);
        });
        self.setGlobalFeedback(feedback.GLOBAL);
    };

    self.clearFeedback = function () {
        call(inputs, 'clearFeedback');
        self.clearGlobalFeedback();
    };

    self.disable = function () {
        call(inputs, 'disable');
    };

    self.enable = function () {
        call(inputs, 'enable');
    };

    self.validate = fig.validate || function (data) {
        return {};
    };

    var filterInputs = function () {
        var filteredTypes = argumentsToArray(arguments);
        return filter(inputs, function (input) {
            return !inArray(filteredTypes, input.getType());
        });
    };

    self.get = function () {
        return call(filterInputs('file', 'button'), 'get');
    };

    self.set = function (name, value) {
        inputs[name].set(value);
    };

    self.clear = function (options) {
        options = options || {};
        var notCleared = options.isClearHidden ?
            ['button'] : ['button', 'hidden'];
        call(filterInputs.apply(null, notCleared), 'clear');
    };

    ajax($self, {

        url: url,

        dataType: 'json',

        getData: self.get,

        validate: function () {
            var errors = self.validate(self.get());
            if(isEmpty(errors)) {
                return true;
            }
            else {
                self.setFeedback(errors);
                self.publish('error', errors);
                return false;
            }
        },

        onprogress: function (e) {
            callIfFunction(partial(fig.onprogress, e));
            console.log(e.loaded, e.total);
        },

        beforeSend: function () {
            callIfFunction(fig.beforeSend);
            self.disable();
            self.publish('beforeSend');
        },
        success: function (response) {
            callIfFunction(partial(fig.success, response));
            response = response || {};
            self.setGlobalSuccess(response.successMessage);
            self.publish('success', response);
        },
        error: function (response) {
            // setTimeout(function () {
            callIfFunction(partial(fig.error, response));
            self.setFeedback(response);
            self.publish('error', response);

            // }, 500);
        },
        complete: function () {
            // setTimeout(function () {
            callIfFunction(fig.complete);
            self.enable();
            self.publish('complete');
            // }, 500);
        }
    });

    return self;
};

var forminator = {};

forminator.init = function (fig) {
    var factory = createFactory(fig),
        form = factory.form();

    return form;
};

window.forminator = forminator;

}());
