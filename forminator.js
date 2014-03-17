// forminator version 0.0.0
// https://github.com/DubFriend/forminator
// (MIT) 16-03-2014
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

    var getData = function (figData) {
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
                    if(isCheckBoxOrRadio()) {
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

        // console.log('figData', figData);

        return figData ? flattenData(figData) : getFormsData();
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
        var status = metaData && metaData.status || response && response.status || 200;
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

    var ajax2 = function (figFN) {
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

            // console.log(grouped);

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

            var fig = applyFigDefaults(figFN());

            if(!fig.validate || fig.validate()) {

                var formData = new FormData();

                foreach(fig.data, function (value, key) {
                    formData.append(key, value);
                });

                foreach(getFileElements(), function ($file, name) {
                    var file = $file[0];
                    if(file.files.length > 0) {
                        if(file.files.length === 1) {
                            formData.append(name, file.files[0]);
                        }
                        else {
                            foreach(file.files, function (file, index) {
                                // console.log(file);
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

    var iframeAjax = function (figFN) {
        $form.submit(function (e) {
            e.stopPropagation();
            console.log('iframeAjax');

            var fig = applyFigDefaults(figFN());

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


                // remove names of existing inputs so they are not sent to the
                // server and send the data given by getData instead.
                removeNonFileInputsNames();
                var hiddenInputs = [];
                foreach(fig.data, function (value, name) {
                    var $hidden = $(
                        '<input type="hidden" ' +
                               'name="' + name + '" ' +
                               'value="' + value + '"/>'
                    );
                    $form.prepend($hidden);
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

    var applyFigDefaults = function (fig) {
        fig.url = fig.url || $form.attr('action');
        fig.data = getData(fig.data);
        return fig;
    };

    var fileAjax = function (figFN, isForceIFrame) {
        $form = $(this);

        if(!$form.is('form')) {
            throw 'selected element must be a form element';
        }

        if(
            $.support.ajax &&
            typeof FormData !== "undefined" &&
            isForceIFrame !== true
        ) {
            ajax2(figFN);
        }
        else {
            iframeAjax(figFN);
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

var toInt = function (value) {
    return parseInt(value, 10);
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

var call = function (collection, functionName, args) {
    return map(collection, function (object, name) {
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
    var args = Array.prototype.slice.call(arguments, 1);
    if(isFunction(fn)) {
        return fn.apply(null, args);
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

var $getAnyForminatorModule = function (preSelector, name, moduleName) {
    return $(
        preSelector +
        (moduleName ? '-' + moduleName : '') +
        (name ? '-' + name : '')
    );
};

var $getForminatorByClass = partial($getAnyForminatorModule, '.frm');
var createFactory = function (fig) {
    var self = {},
        url = fig.url,
        name = fig.name,
        fieldMap = fig.fieldMap || {},
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
            onprogress: fig.onprogress,
            success: fig.success,
            error: fig.error,
            complete: fig.complete,
            url: url,
            inputs: getMappedFormInputs($module)
        });
    }, $getModuleByClass(''));

    self.list = buildModuleIfExists(function ($module) {
        return createList({
            $: $module,
            fieldMap: fieldMap
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

var ajax = function ($form, figFN) {

    var applyDefaultFig = function () {
        var fig = figFN();
        fig.type = fig.type || 'POST';
        fig.dataType = fig.dataType ? fig.dataType.toLowerCase() : 'json';
        return fig;
    };

    var applyDefaultFileAjaxFig = function () {
        var fig = applyDefaultFig();
        fig.data = map(fig.data || {}, identity, function (key) {
            return key.replace(/\[\]$/, '');
        });
        return fig;
    };

    if($form.find('input[type="file"]').length) {
        console.log('$.fn.fileAjax');
        $form.fileAjax(applyDefaultFileAjaxFig, false);
    }
    else {
        console.log('$.ajax');
        // form has no files, use standard ajax.
        $form.submit(function (e) {
            e.preventDefault();

            var fig = applyDefaultFig();
            if(fig.validate()) {
                $.ajax({
                    url: fig.url,
                    type: fig.type,
                    data: fig.data,
                    dataType: fig.dataType,
                    beforeSend: fig.beforeSend,
                    success: function (response) {
                        if(
                            isObject(response) &&
                            (response.status < 200 || response.status >= 300)
                        ) {
                            callIfFunction(fig.error, response);
                        }
                        else {
                            callIfFunction(fig.success, response);
                        }
                    },
                    error: function (jqXHR) {
                        callIfFunction(
                            fig.error,
                            fig.dataType === 'json' ?
                                jqXHR.responseJSON : jqXHR.responseText
                        );
                    },
                    complete: function (jqXHR) {
                        callIfFunction(
                            fig.complete,
                            fig.dataType === 'json' ?
                                jqXHR.responseJSON : jqXHR.responseText
                        );
                    }
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

        newValues = isArray(newValues) ? newValues : [newValues];

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
        if(!newValue) {
            self.$().prop('checked', false);
        }
        else {
            self.$().filter('[value="' + newValue + '"]').prop('checked', true);
        }
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
            var name = $(this).attr('name');
            group[name] = factory.input[type]({
                $: $(this)
            });
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

var createFormBase = function (fig) {
    var self = mixinPubSub(),
        $self = fig.$,
        $feedback = $self.find('.frm-global-feedback'),
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

        self.clearGlobalError = function () {
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

    self.clearGlobalFeedback = function () {
        self.clearGlobalError();
        self.clearGlobalSuccess();
    };

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

    var onlyInputs = function () {
        var filteredTypes = argumentsToArray(arguments);
        return filter(inputs, function (input) {
            return inArray(filteredTypes, input.getType());
        });
    };

    self.get = function () {
        return call(filterInputs('file', 'button'), 'get');
    };

    self.set = function (nameOrObject, valueOrNothing) {
        if(isObject(nameOrObject)) {
            foreach(nameOrObject, function (value, name) {
                self.set(name, value);
            });
        }
        else {
            if(inputs[nameOrObject]) {
                inputs[nameOrObject].set(valueOrNothing);
            }
        }
    };

    self.clear = function (options) {
        options = options || {};
        var notCleared = options.isClearHidden ?
            ['button'] : ['button', 'hidden'];
        call(filterInputs.apply(null, notCleared), 'clear');
    };

    (function () {
        var defaultData = self.get();
        self.reset = function () {
            call(onlyInputs('file'), 'clear');
            self.set(copy(defaultData));
        };
    }());

    return self;
};

var createForm = function (fig) {
    var self = createFormBase(fig),
        ajax = fig.ajax,
        url = fig.url || fig.$.attr('action');

    self.setAction = function (action) {
        url = queryjs.set(url, { action: action });
    };

    ajax(fig.$, function() {
        return {

            url: url,

            dataType: 'json',

            data: self.get(),

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
            complete: function (response) {
                // setTimeout(function () {
                callIfFunction(fig.complete, response);
                self.enable();
                self.publish('complete', response);
                // }, 500);
            }
        };
    });


    return self;
};

var createSearch = function (fig) {
    var self = createFormBase(fig),
        $self = fig.$,
        request = fig.request;

    $self.submit(function (e) {
        e.preventDefault();
        request.setFilter(self.get());
        request.search();
    });

    return self;
};
var createOrdinator = function (fig) {
    var self = {},
        $self = fig.$,
        request = fig.request,
        orderIcons = fig.orderIcons || {
            neutral: '&#8597;',
            ascending: '&#8593;',
            descending: '&#8595;'
        },
        fields = (function () {
            var fields = {};
            $self.find('[data-field]').each(function () {
                var $self = $(this);
                fields[$self.data('field')] = (function () {
                    var self = {},
                        $order = $self.is('[data-order]') ?
                            $self : $self.find('[data-order]'),
                        currentOrder = $order.data('order') || 'neutral';

                    self.set = function (order) {
                        $order.data('order', order);
                        $order.html(orderIcons[order]);
                        currentOrder = order;
                    };

                    self.get = function () {
                        return currentOrder;
                    };

                    self.next = function () {
                        var ordering = ['ascending', 'descending'],
                            nextOrder = ordering[
                                (indexOf(ordering, currentOrder) + 1) %
                                ordering.length
                            ];
                        self.set(nextOrder);
                    };

                    return self;
                }());
            });
            return fields;
        }());


    $self.find('[data-field]').click(function () {
        var fieldName = $(this).data('field');
        call(excludedSet(fields, [fieldName]), 'set', ['neutral']);
        fields[fieldName].next();
        request.setOrder(map(call(fields, 'get'), function (order) {
            return order === 'neutral' ? '' : order;
        }));
        request.search();
    });

    return self;
};

var createGotoPage = function (fig) {
    var self = createFormBase(fig),
        errorMessages = union({
            noPage: "Must enter a page number.",
            notAnInteger: "Must enter valid page number.",
            nonPositiveNumber: "Page number must be positive.",
            pageNumberOutOfBounds: "Page number cannot exceed " +
                                   "the total number of pages."
        }, fig.errorMessages || {}),
        $self = fig.$;

    self.validate = function (data, maxPageNumber) {
        var errors = {};
        var pageNumber = toInt(data.page);
        if(!data.page) {
            errors.page = errorMessages.noPage;
        }
        else if(isNaN(pageNumber)) {
            errors.page = errorMessages.notAnInteger;
        }
        else if(pageNumber <= 0) {
            errors.page = errorMessages.nonPositiveNumber;
        }
        else if(pageNumber > maxPageNumber) {
            errors.page = errorMessages.pageNumberOutOfBounds;
        }
        return errors;
    };

    $self.submit(function (e) {
        e.preventDefault();
        self.publish('submit', self.get());
    });

    return self;
};
var createPaginator = function (fig) {
    var self = {},
        name = fig.name,
        request = fig.request,

        $numberOfPages = $('.frm-number-of-pages-' + name ),
        $numberOfResults = $('.frm-number-of-results-' + name),
        $pageNumbers = $('.frm-page-numbers-' + name),
        $gotoPage = $('.frm-goto-page-' + name),
        $previous = $('.frm-previous-' + name),
        $next = $('.frm-next-' + name),

        getDataNumber = function ($el) {
            return $el.is('data-number') ? $el : $el.find('data-number');
        },

        page = toInt(getDataNumber(
            $pageNumbers.find('.frm-number-container.selected'
        )).data('number')) || 1,
        numberOfPages = toInt($numberOfPages.html()) || page,
        numberOfResults = toInt($numberOfResults.html()) || null,

        // note: $itemTemplate should be initialized after visiblePages and
        // currentPage are initialized.
        $itemTemplate = (function () {
            var $el = $pageNumbers
                    .find('.frm-number-container:first-child').clone();
            $el.removeClass('selected');
            getDataNumber($el).html('').data('number', '');
            return $el;
        }()),

        setNumberOfPages = function (newNumberOfPages) {
            newNumberOfPages = toInt(newNumberOfPages);
            if(newNumberOfPages !== numberOfPages) {
                $numberOfPages.html(newNumberOfPages);
                numberOfPages = newNumberOfPages;
            }
        },

        setNumberOfResults = function (newNumberOfResults) {
            newNumberOfResults = toInt(newNumberOfResults);
            if(newNumberOfResults !== numberOfResults) {
                $numberOfResults.html(newNumberOfResults);
                numberOfResults = newNumberOfResults;
            }
        },

        calculatePagesToRender = function () {
            var pages = range(page - 3, page + 3);

            var rollOver = function (array) {
                array.shift();
                array.push(last(array) + 1);
                return array;
            };

            while(pages[0] < 1) {
                pages = rollOver(pages);
            }

            while(!isEmpty(pages) && last(pages) > numberOfPages) {
                pages.pop();
            }

            return pages;
        },

        createPageItem = function (fig) {
            var self = {},
                $self = fig.$,
                $number = $self.find('[data-number]'),
                pageNumber = fig.pageNumber || toInt($number.data('number'));

            self.set = function (newPageNumber) {
                newPageNumber = toInt(newPageNumber);
                if(pageNumber !== newPageNumber) {
                    $number.html(newPageNumber);
                    pageNumber = newPageNumber;
                }
            };

            self.get = function () {
                return pageNumber;
            };

            self.setSelected = function () {
                $self.addClass('selected');
            };

            self.clearSelected = function () {
                $self.removeClass('selected');
            };

            self.destroy = function () {
                $self.remove();
            };

            $number.html(pageNumber);

            $self.click(function () {
                page = pageNumber;
                request.setPage(pageNumber);
                request.search();
            });

            return self;
        },

        pages = (function () {
            pages = [];
            $pageNumbers.find('.frm-number-container').each(function () {
                pages.push(createPageItem({
                    $: $(this)
                }));
            });
            return pages;
        }()),

        getPageObjectWithPageNumber = function (pageNumber) {
            var itemsArray = filter(pages, function (pageObject) {
                return pageObject.get() === pageNumber;
            });
            return isEmpty(itemsArray) ? null : itemsArray[0];
        },

        updatePages = function () {
            var i = 0;
            foreach(calculatePagesToRender(), function (pageNumber) {
                if(pages[i]) {
                    pages[i].set(pageNumber);
                }
                else {
                    var $item = $itemTemplate.clone();
                    $pageNumbers.append($item);
                    pages[i] = createPageItem({
                        pageNumber: pageNumber,
                        $: $item
                    });
                }
                i += 1;
            });
            // remove excess pages
            while(pages[i]) {
                pages[i].destroy();
                pages.splice(i, 1);
            }
        };

    request.subscribe('success', function (response) {
        if(toInt(response.numberOfPages) === 0 || response.numberOfPages) {
            setNumberOfPages(response.numberOfPages);
        }
        if(response.numberOfResults) {
            setNumberOfResults(response.numberOfResults);
        }
        updatePages();
        call(pages, 'clearSelected');
        var selectedPage = getPageObjectWithPageNumber(page);
        if(selectedPage) {
            selectedPage.setSelected();
        }
    });

    return self;
};

var createRequest = function (fig) {
    var self = mixinPubSub(),
        ajax = fig.ajax,
        url = fig.url,
        data = {},
        buildURL = function () {
            return queryjs.set(url, filter(data || {}, function (value) {
                // only return non empty arrays and non falsey values (except 0)
                return isArray(value) ? value.length : value || value === 0;
            }));
        },
        set = function (values) {
            data = union(data, values);
        };

    self.setOrder = function (values) {
        set(map(values, identity, function (key) {
            return 'order_' + (isArray(key) ? key.join(',') : key);
        }));
    };

    self.setFilter = function (values) {
        set(map(values, identity, function (key) {
            return 'filter_' + (isArray(key) ? key.join(',') : key);
        }));
    };

    self.setPage = function (pageNumber) {
        set({ page: pageNumber });
    };

    self.search = function () {
        ajax({
            type: 'GET',
            url: buildURL(),
            dataType: 'json',
            success: function (response) {
                self.publish('success', response);
            },
            error: function (jqXHR) {
                self.publish('error', jqXHR.responseJSON);
            },
            complete: function (jqXHR) {
                self.publish('complete', jqXHR.responseJSON);
            }
        });
    };

    return self;
};
var createListItem = function (fig) {
    var self = mixinPubSub(),
        fieldMap = fig.fieldMap || {},
        defaultMap = function (value) {
            return isArray(value) ? value.join(', ') : value;
        },
        $self = fig.$self,

        render = function (fields) {
            foreach(fields, function (value, name) {
                $self.find('[data-field="' + name + '"]')
                    .html(fieldMap[name] ? fieldMap[name](value) : defaultMap(value));
            });
        },

        getFieldsFromDataValueAttribute = function () {
            var parseDataValue = function (value) {
                // does begin and end with brackets (denotes array of data) ?
                return (/^\[.*\]$/).test(value) ?
                    map(
                        // strip trailing and leading brackets and split on comma
                        value.replace(/^\[/, '').replace(/\]$/, '').split(','),
                        function (token) {
                            // String.trim() not available in ie8 and earlier.
                            return token.replace(/^\s*/, '').replace(/\s*$/, '');
                        }
                    ) : value;
            };
            var data = {};
            $self.find('[data-field]').each(function () {
                data[$(this).data('field')] = parseDataValue($(this).data('value')) || '';
            });
            return data;
        },

        fields = getFieldsFromDataValueAttribute();

    render(fields);


    self.set = function (newValues) {

        var bracketedKeys = map(newValues, identity, function (unbracketedName) {
            return inArray(keys(fields), unbracketedName + '[]') ?
                unbracketedName + '[]' : unbracketedName;
        });

        var changedFields = filter(bracketedKeys, function (newValue, name) {
            if(typeof fields[name] === 'undefined') {
                return false;
            }
            else  {
                return fields[name] !== newValue;
            }
        });

        fields = union(fields, changedFields);
        render(changedFields);
        return self;
    };

    // sets new values and clears any absent fields
    self.hardSet = function (newValues) {
        self.clear();
        self.set(newValues);
    };

    self.clear = function () {
        $self.find('[data-field]').html('');
        $self.find('[data-value]').attr('data-value', '');
        fields = map(fields, function () { return ''; });
        return self;
    };

    self.destroy = function () {
        $self.remove();
    };

    self.get = function () {
        return copy(fields);
    };

    (function () {
        var hasSelectedClass = false;
        self.addSelectedClass = function () {
            if(!hasSelectedClass) {
                $self.addClass('selected');
            }
            hasSelectedClass = true;
        };

        self.removeSelectedClass = function () {
            if(hasSelectedClass) {
                $self.removeClass('selected');
            }
            hasSelectedClass = false;
        };
    }());

    $self.dblclick(function () {
        self.publish('selected', self);
    });

    return self;
};


var createList = function (fig) {
    var self = mixinPubSub(),
        fieldMap = fig.fieldMap || {},
        $self = fig.$,

        $itemTemplate = (function () {
            var $el = $self.find('.frm-list-item:first-child').clone();
            // use ListItems clear method to clean out the template.
            var listItem = createListItem({
                $self: $el,
                fieldMap: fieldMap
            });
            listItem.clear();
            return $el;
        }()),

        subscribeListItem = function (listItem) {
            listItem.subscribe('selected', function () {
                call(items, 'removeSelectedClass');
                listItem.addSelectedClass();
                self.publish('selected', listItem);
            });
            return listItem;
        },

        items = (function () {
            var items = [];
            $self.find('.frm-list-item').each(function () {
                items.push(subscribeListItem(createListItem({
                    $self: $(this),
                    fieldMap: fieldMap
                })));
            });
            return items;
        }());

    // erase old set, replace with given items
    self.set = function (newItemsData) {
        var newElems = [];
        foreach(newItemsData, function(newItemData, index) {
            var $new;
            if(items[index]) {
                items[index].hardSet(newItemData);
            }
            else {
                $new = $itemTemplate.clone();
                newElems.push($new);
                items[index] = subscribeListItem(createListItem({
                    $self: $new,
                    fieldMap: fieldMap
                }));
                items[index].set(newItemData);
            }
        });
        $self.append(newElems);

        if(items.length > newItemsData.length) {
            call(
                items.splice(
                    newItemsData.length,
                    items.length - newItemsData.length
                ),
                'destroy'
            );
        }
    };

    return self;
};

var createNewItemButton = function (fig) {
    var self = mixinPubSub(),
        $self = fig.$;

    $self.click(function () {
        self.publish('click');
    });

    return self;
};

var forminator = {};

forminator.init = function (fig) {
    var factory = createFactory(fig),
        form = factory.form(),
        list = factory.list(),
        newItemButton = factory.newItemButton(),
        request = factory.request(),
        search = factory.search(request),
        ordinator = factory.ordinator(request),
        paginator = factory.paginator(request);

    form.setAction('create');

    if(list && form) {
        list.subscribe('selected', function (listItem) {
            form.set(listItem.get());
            form.setAction('update');
        });

        if(newItemButton) {
            newItemButton.subscribe('click', function () {
                form.reset();
                form.clearFeedback();
            });
        }
    }

    if(list) {
        request.subscribe('success', function (response) {
            console.log('request:success', response);
            list.set(response ? response.results : []);
        });
    }

    return { form: form, list: list };
};

window.forminator = forminator;

}());
