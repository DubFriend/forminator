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

}(jQuery));
